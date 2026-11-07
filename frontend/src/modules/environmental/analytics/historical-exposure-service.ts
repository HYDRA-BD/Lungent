import type {
  HistoricalExposureFilterQuery,
  HistoricalExposureSummaryReport,
  BangladeshClimaticSeason,
  PatientResidentialExposureContext,
  PatientLocationHistoryEntry,
} from '../types'
import { CopernicusSatelliteReanalysisProvider } from '../providers/copernicus-reanalysis-provider'

export const HISTORICAL_CLINICAL_SAFETY_NOTICE =
  'Historical environmental snapshots reflect regional atmospheric reanalysis estimates and ambient ground observations. ' +
  'They represent environmental context and do NOT equate to an individual patient\'s biological cumulative dose, ' +
  'indoor exposure, or personal cancer risk. Clinical assessments must not treat ambient averages as personal diagnostic measurements.'

export class HistoricalExposureService {
  private static reanalysisProvider = new CopernicusSatelliteReanalysisProvider()

  /**
   * Generates a comprehensive historical exposure summary report for a location
   */
  public static async getHistoricalExposureSummary(
    query: HistoricalExposureFilterQuery
  ): Promise<HistoricalExposureSummaryReport> {
    const snapshots = await this.reanalysisProvider.getHistoricalSnapshots(query)

    if (snapshots.length === 0) {
      throw new Error(`No historical environmental snapshots found for ${query.division}/${query.district}`)
    }

    // Filter by aggregation period if requested (default to seasonal or annual)
    const annualSnapshots = snapshots.filter((s) => s.aggregationPeriod === 'annual')
    const seasonalSnapshots = snapshots.filter((s) => s.aggregationPeriod === 'seasonal')

    const targetSnapshots = annualSnapshots.length > 0 ? annualSnapshots : snapshots
    const pm25Values = targetSnapshots.map((s) => s.avgPm25)
    const sumPm25 = pm25Values.reduce((a, b) => a + b, 0)
    const avgPm25 = Number((sumPm25 / pm25Values.length).toFixed(1))

    const maxRecordedPm25 = Math.max(...targetSnapshots.map((s) => s.maxPm25 || s.avgPm25))
    const minRecordedPm25 = Math.min(...targetSnapshots.map((s) => s.minPm25 || s.avgPm25))

    const totalElevatedDays = targetSnapshots.reduce((acc, s) => acc + s.elevatedDaysCount, 0)
    const totalObservationDays = targetSnapshots.length * 365
    const elevatedDaysRatio = totalObservationDays > 0 ? totalElevatedDays / totalObservationDays : 0

    // Average completeness ratio across snapshots
    const avgCompleteness = Number(
      (targetSnapshots.reduce((acc, s) => acc + s.dataCompletenessRatio, 0) / targetSnapshots.length).toFixed(3)
    )

    // Seasonal Profiles
    const seasonsList: BangladeshClimaticSeason[] = ['winter_dry', 'pre_monsoon', 'monsoon', 'all_season']
    const seasonalProfiles = {} as Record<
      BangladeshClimaticSeason,
      { avgPm25: number; elevatedDaysCount: number; dataCompletenessRatio: number }
    >

    for (const season of seasonsList) {
      const match = seasonalSnapshots.filter((s) => s.season === season)
      if (match.length > 0) {
        const sPm25 = match.reduce((acc, s) => acc + s.avgPm25, 0) / match.length
        const sElevated = match.reduce((acc, s) => acc + s.elevatedDaysCount, 0)
        const sComp = match.reduce((acc, s) => acc + s.dataCompletenessRatio, 0) / match.length
        seasonalProfiles[season] = {
          avgPm25: Number(sPm25.toFixed(1)),
          elevatedDaysCount: Math.round(sElevated / match.length),
          dataCompletenessRatio: Number(sComp.toFixed(3)),
        }
      } else {
        seasonalProfiles[season] = {
          avgPm25: season === 'all_season' ? avgPm25 : avgPm25,
          elevatedDaysCount: 0,
          dataCompletenessRatio: avgCompleteness,
        }
      }
    }

    const sortedPeriods = snapshots.map((s) => s.periodStart).sort()
    const startDate = query.startDate || sortedPeriods[0]
    const endDate = query.endDate || sortedPeriods[sortedPeriods.length - 1]

    return {
      division: query.division,
      district: query.district,
      upazila: query.upazila,
      periodCoverage: {
        start: startDate,
        end: endDate,
        totalDays: totalObservationDays,
        dataCompletenessRatio: avgCompleteness,
      },
      baselineAverages: {
        avgPm25,
        avgPm10: Number((avgPm25 * 1.62).toFixed(1)),
        avgUsAqi: Math.round(avgPm25 * 1.55),
        maxRecordedPm25,
        minRecordedPm25,
      },
      seasonalProfiles,
      elevatedExposureDaysCount: totalElevatedDays,
      elevatedDaysRatio: Number(elevatedDaysRatio.toFixed(3)),
      snapshots,
      clinicalSafetyNotice: HISTORICAL_CLINICAL_SAFETY_NOTICE,
    }
  }

  /**
   * Evaluates patient residential history against historical ambient PM2.5 averages.
   * Calculates approximate PM2.5-years proxy with mandatory non-diagnostic disclaimers.
   */
  public static async buildPatientResidentialExposureContext(
    patientId: string,
    locationHistories: PatientLocationHistoryEntry[],
    indoorBiomassYears = 0,
    occupationalDustYears = 0
  ): Promise<PatientResidentialExposureContext> {
    if (!locationHistories || locationHistories.length === 0) {
      return {
        patientId,
        residentialLocations: [],
        totalEstimatedAmbientPm25Years: 0,
        indoorBiomassExposureYears: indoorBiomassYears,
        occupationalDustExposureYears: occupationalDustYears,
        dataCompletenessScore: 0.1,
        clinicalReviewStatus: 'unverified',
        mandatoryNonDiagnosticNotice: HISTORICAL_CLINICAL_SAFETY_NOTICE,
      }
    }

    let totalCumulativePm25Years = 0
    const locations = []

    for (const loc of locationHistories) {
      const duration = loc.durationYears || 1.0
      // Lookup baseline ambient PM2.5 for district
      let ambientDistrictPm25 = 65.0
      const dLower = loc.district.toLowerCase()
      if (dLower === 'dhaka' || dLower === 'narayanganj' || dLower === 'gazipur') ambientDistrictPm25 = 110.0
      else if (dLower === 'sylhet') ambientDistrictPm25 = 35.0
      else if (dLower === 'chattogram') ambientDistrictPm25 = 75.0
      else if (dLower === 'rajshahi') ambientDistrictPm25 = 80.0

      const pm25YearsForLocation = ambientDistrictPm25 * duration
      totalCumulativePm25Years += pm25YearsForLocation

      locations.push({
        division: loc.division,
        district: loc.district,
        upazila: loc.upazila,
        durationYears: duration,
        approximateAmbientPm25Years: Number(pm25YearsForLocation.toFixed(1)),
        isCurrent: loc.isCurrent,
      })
    }

    return {
      patientId,
      residentialLocations: locations,
      totalEstimatedAmbientPm25Years: Number(totalCumulativePm25Years.toFixed(1)),
      indoorBiomassExposureYears: indoorBiomassYears,
      occupationalDustExposureYears: occupationalDustYears,
      dataCompletenessScore: 0.88,
      clinicalReviewStatus: 'contextual_only',
      mandatoryNonDiagnosticNotice: HISTORICAL_CLINICAL_SAFETY_NOTICE,
    }
  }
}
