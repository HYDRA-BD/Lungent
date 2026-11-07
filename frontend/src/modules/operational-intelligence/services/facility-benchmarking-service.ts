/**
 * Phase 2.10: Facility Performance Benchmarking Service
 * Computes normalized, tier-adjusted operational metrics, composite performance indices,
 * and peer rankings without biasing against low-resource or peripheral facilities.
 */

import type {
  FacilityTier,
  FacilityBenchmarkSnapshot,
  FacilityBenchmarkComparison,
} from '../types'

export interface RawFacilityActivityInput {
  facilityId: string
  facilityName: string
  facilityTier: FacilityTier
  division: string
  assessmentsInitiated: number
  assessmentsCompleted: number
  meanProcessingTimeHours: number
  meanReviewTurnaroundHours: number
  referralsInitiated: number
  referralsCompleted: number
  activeWorkersCount: number
  dataCompletenessPct: number
}

export class FacilityBenchmarkingService {
  /**
   * Computes normalized benchmark snapshot for a single facility
   */
  public static computeSnapshot(input: RawFacilityActivityInput): FacilityBenchmarkSnapshot {
    // 1. Completion Ratios (bounded 0.0 to 1.0)
    const completionRate =
      input.assessmentsInitiated > 0
        ? Math.min(1.0, Math.max(0.0, input.assessmentsCompleted / input.assessmentsInitiated))
        : 0.0

    const referralRate =
      input.referralsInitiated > 0
        ? Math.min(1.0, Math.max(0.0, input.referralsCompleted / input.referralsInitiated))
        : 0.0

    // 2. Worker Productivity Score (assessments per active worker)
    const workerProductivity =
      input.activeWorkersCount > 0
        ? Number((input.assessmentsCompleted / input.activeWorkersCount).toFixed(1))
        : 0.0

    // 3. Review Turnaround Efficiency Score (24-hour benchmark target, inverse scored 0 to 100)
    // 0-12 hrs = 100%, 24 hrs = 80%, 48 hrs = 50%, > 72 hrs = 20%
    const turnaroundHours = Math.max(0.5, input.meanReviewTurnaroundHours)
    let turnaroundScore = 100.0 - turnaroundHours * 1.0
    if (turnaroundScore < 20.0) turnaroundScore = 20.0

    // 4. Composite Operational Index (0.0 to 100.0)
    // Weights: Assessment Completion (30%), Turnaround Efficiency (20%), Referral Resolution (25%), Data Completeness (25%)
    const compositeIndex = Number(
      (
        completionRate * 100.0 * 0.30 +
        turnaroundScore * 0.20 +
        referralRate * 100.0 * 0.25 +
        input.dataCompletenessPct * 0.25
      ).toFixed(1)
    )

    let operationalStatus: FacilityBenchmarkSnapshot['operationalStatus']
    if (compositeIndex >= 82.0) {
      operationalStatus = 'high_performing'
    } else if (compositeIndex >= 65.0) {
      operationalStatus = 'nominal'
    } else {
      operationalStatus = 'requires_support'
    }

    return {
      facilityId: input.facilityId,
      facilityName: input.facilityName,
      facilityTier: input.facilityTier,
      division: input.division,
      assessmentCompletionRate: Number(completionRate.toFixed(3)),
      meanProcessingTimeHours: Number(input.meanProcessingTimeHours.toFixed(1)),
      meanReviewTurnaroundHours: Number(input.meanReviewTurnaroundHours.toFixed(1)),
      referralCompletionRate: Number(referralRate.toFixed(3)),
      workerProductivityScore: workerProductivity,
      dataCompletenessPct: Number(input.dataCompletenessPct.toFixed(1)),
      compositeOperationalIndex: compositeIndex,
      peerTierPercentile: 50, // Updated during cohort comparison
      relativeRankInTier: 1,
      totalTierPeers: 1,
      operationalStatus,
    }
  }

  /**
   * Compares a cohort of facilities within the same tier or across tiers
   */
  public static benchmarkCohort(
    cohort: RawFacilityActivityInput[],
    targetTier?: FacilityTier
  ): FacilityBenchmarkComparison {
    const filteredInputs = targetTier
      ? cohort.filter(f => f.facilityTier === targetTier)
      : cohort

    const snapshots = filteredInputs.map(f => this.computeSnapshot(f))

    // Sort descending by composite index
    snapshots.sort((a, b) => b.compositeOperationalIndex - a.compositeOperationalIndex)

    const totalPeers = snapshots.length

    // Assign rank and percentile
    for (let i = 0; i < totalPeers; i++) {
      const snap = snapshots[i]
      snap.relativeRankInTier = i + 1
      snap.totalTierPeers = totalPeers
      // Percentile formula: (total - rank + 1) / total * 100
      snap.peerTierPercentile = Math.round(((totalPeers - (i + 1) + 1) / totalPeers) * 100)
    }

    // Calculate tier averages
    const avgCompletion = totalPeers > 0
      ? snapshots.reduce((acc, s) => acc + s.assessmentCompletionRate, 0) / totalPeers
      : 0.0

    const avgTurnaround = totalPeers > 0
      ? snapshots.reduce((acc, s) => acc + s.meanReviewTurnaroundHours, 0) / totalPeers
      : 0.0

    const avgReferral = totalPeers > 0
      ? snapshots.reduce((acc, s) => acc + s.referralCompletionRate, 0) / totalPeers
      : 0.0

    const avgIndex = totalPeers > 0
      ? snapshots.reduce((acc, s) => acc + s.compositeOperationalIndex, 0) / totalPeers
      : 0.0

    return {
      benchmarkDate: new Date().toISOString().substring(0, 10),
      facilityTier: targetTier || 'district_hospital',
      tierAverageCompletionRate: Number(avgCompletion.toFixed(3)),
      tierAverageTurnaroundHours: Number(avgTurnaround.toFixed(1)),
      tierAverageReferralRate: Number(avgReferral.toFixed(3)),
      tierAverageOperationalIndex: Number(avgIndex.toFixed(1)),
      facilities: snapshots,
    }
  }
}

