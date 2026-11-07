export interface GeographicLevel {
  id: string
  name: string
  nameBn: string
}

export interface DistrictData extends GeographicLevel {
  upazilas: GeographicLevel[]
}

export interface DivisionData extends GeographicLevel {
  districts: Record<string, DistrictData>
}

export interface CountryGeographicData {
  countryCode: string
  name: string
  nameBn: string
  divisions: Record<string, DivisionData>
}

/**
 * Bangladesh Official Geographic & Administrative Hierarchy Reference Data
 */
export const BANGLADESH_GEOGRAPHY: CountryGeographicData = {
  countryCode: 'BD',
  name: 'Bangladesh',
  nameBn: 'বাংলাদেশ',
  divisions: {
    Dhaka: {
      id: 'Dhaka',
      name: 'Dhaka',
      nameBn: 'ঢাকা',
      districts: {
        Dhaka: {
          id: 'Dhaka',
          name: 'Dhaka',
          nameBn: 'ঢাকা',
          upazilas: [
            { id: 'Mirpur', name: 'Mirpur', nameBn: 'মিরপুর' },
            { id: 'Mohakhali', name: 'Mohakhali', nameBn: 'মহাখালী' },
            { id: 'Dhanmondi', name: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
            { id: 'Uttara', name: 'Uttara', nameBn: 'উত্তরা' },
            { id: 'Savar', name: 'Savar', nameBn: 'সাভার' },
            { id: 'Dhamrai', name: 'Dhamrai', nameBn: 'ধামরাই' },
            { id: 'Keraniganj', name: 'Keraniganj', nameBn: 'কেরানীগঞ্জ' },
          ],
        },
        Gazipur: {
          id: 'Gazipur',
          name: 'Gazipur',
          nameBn: 'গাজীপুর',
          upazilas: [
            { id: 'Gazipur_Sadar', name: 'Gazipur Sadar', nameBn: 'গাজীপুর সদর' },
            { id: 'Sreepur', name: 'Sreepur', nameBn: 'শ্রীপুর' },
            { id: 'Kaliakair', name: 'Kaliakair', nameBn: 'কালিয়াকৈর' },
            { id: 'Kapasia', name: 'Kapasia', nameBn: 'কাপাসিয়া' },
            { id: 'Kaliganj', name: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          ],
        },
        Narayanganj: {
          id: 'Narayanganj',
          name: 'Narayanganj',
          nameBn: 'নারায়ণগঞ্জ',
          upazilas: [
            { id: 'Narayanganj_Sadar', name: 'Narayanganj Sadar', nameBn: 'নারায়ণগঞ্জ সদর' },
            { id: 'Bandar', name: 'Bandar', nameBn: 'বন্দর' },
            { id: 'Rupganj', name: 'Rupganj', nameBn: 'রূপগঞ্জ' },
            { id: 'Sonargaon', name: 'Sonargaon', nameBn: 'সোনারগাঁও' },
            { id: 'Araihazar', name: 'Araihazar', nameBn: 'আড়াইহাজার' },
          ],
        },
        Tangail: {
          id: 'Tangail',
          name: 'Tangail',
          nameBn: 'টাঙ্গাইল',
          upazilas: [
            { id: 'Tangail_Sadar', name: 'Tangail Sadar', nameBn: 'টাঙ্গাইল সদর' },
            { id: 'Mirzapur', name: 'Mirzapur', nameBn: 'মির্জাপুর' },
            { id: 'Madhupur', name: 'Madhupur', nameBn: 'মধুপুর' },
          ],
        },
      },
    },
    Chattogram: {
      id: 'Chattogram',
      name: 'Chattogram',
      nameBn: 'চট্টগ্রাম',
      districts: {
        Chattogram: {
          id: 'Chattogram',
          name: 'Chattogram',
          nameBn: 'চট্টগ্রাম',
          upazilas: [
            { id: 'Panchlaish', name: 'Panchlaish', nameBn: 'পাঁচলাইশ' },
            { id: 'Kotwali', name: 'Kotwali', nameBn: 'কোতোয়ালী' },
            { id: 'Hathazari', name: 'Hathazari', nameBn: 'হাটহাজারী' },
            { id: 'Sitakunda', name: 'Sitakunda', nameBn: 'সীতাকুণ্ড' },
          ],
        },
        Coxs_Bazar: {
          id: 'Coxs_Bazar',
          name: "Cox's Bazar",
          nameBn: 'কক্সবাজার',
          upazilas: [
            { id: 'Coxs_Bazar_Sadar', name: "Cox's Bazar Sadar", nameBn: 'কক্সবাজার সদর' },
            { id: 'Teknaf', name: 'Teknaf', nameBn: 'টেকনাফ' },
            { id: 'Ukhiya', name: 'Ukhiya', nameBn: 'উখিয়া' },
          ],
        },
        Cumilla: {
          id: 'Cumilla',
          name: 'Cumilla',
          nameBn: 'কুমিল্লা',
          upazilas: [
            { id: 'Cumilla_Adarsha_Sadar', name: 'Cumilla Adarsha Sadar', nameBn: 'কুমিল্লা আদর্শ সদর' },
            { id: 'Chandina', name: 'Chandina', nameBn: 'চান্দিনা' },
          ],
        },
      },
    },
    Rajshahi: {
      id: 'Rajshahi',
      name: 'Rajshahi',
      nameBn: 'রাজশাহী',
      districts: {
        Rajshahi: {
          id: 'Rajshahi',
          name: 'Rajshahi',
          nameBn: 'রাজশাহী',
          upazilas: [
            { id: 'Boalia', name: 'Boalia', nameBn: 'বোয়ালিয়া' },
            { id: 'Rajpara', name: 'Rajpara', nameBn: 'রাজপাড়া' },
            { id: 'Paba', name: 'Paba', nameBn: 'পবা' },
          ],
        },
        Bogura: {
          id: 'Bogura',
          name: 'Bogura',
          nameBn: 'বগুড়া',
          upazilas: [
            { id: 'Bogura_Sadar', name: 'Bogura Sadar', nameBn: 'বগুড়া সদর' },
            { id: 'Shajahanpur', name: 'Shajahanpur', nameBn: 'শাজাহানপুর' },
          ],
        },
      },
    },
    Khulna: {
      id: 'Khulna',
      name: 'Khulna',
      nameBn: 'খুলনা',
      districts: {
        Khulna: {
          id: 'Khulna',
          name: 'Khulna',
          nameBn: 'খুলনা',
          upazilas: [
            { id: 'Khulna_Sadar', name: 'Khulna Sadar', nameBn: 'খুলনা সদর' },
            { id: 'Daulatpur', name: 'Daulatpur', nameBn: 'দৌলতপুর' },
            { id: 'Rupsha', name: 'Rupsha', nameBn: 'রূপসা' },
          ],
        },
        Jashore: {
          id: 'Jashore',
          name: 'Jashore',
          nameBn: 'যশোর',
          upazilas: [
            { id: 'Jashore_Sadar', name: 'Jashore Sadar', nameBn: 'যশোর সদর' },
            { id: 'Jhikargachha', name: 'Jhikargachha', nameBn: 'ঝিকরগাছা' },
          ],
        },
      },
    },
    Barishal: {
      id: 'Barishal',
      name: 'Barishal',
      nameBn: 'বরিশাল',
      districts: {
        Barishal: {
          id: 'Barishal',
          name: 'Barishal',
          nameBn: 'বরিশাল',
          upazilas: [
            { id: 'Barishal_Sadar', name: 'Barishal Sadar', nameBn: 'বরিশাল সদর' },
            { id: 'Babuganj', name: 'Babuganj', nameBn: 'বাবুগঞ্জ' },
          ],
        },
      },
    },
    Sylhet: {
      id: 'Sylhet',
      name: 'Sylhet',
      nameBn: 'সিলেট',
      districts: {
        Sylhet: {
          id: 'Sylhet',
          name: 'Sylhet',
          nameBn: 'সিলেট',
          upazilas: [
            { id: 'Sylhet_Sadar', name: 'Sylhet Sadar', nameBn: 'সিলেট সদর' },
            { id: 'Beanibazar', name: 'Beanibazar', nameBn: 'বিয়ানীবাজার' },
            { id: 'Golapganj', name: 'Golapganj', nameBn: 'গোলাপগঞ্জ' },
          ],
        },
      },
    },
    Rangpur: {
      id: 'Rangpur',
      name: 'Rangpur',
      nameBn: 'রংপুর',
      districts: {
        Rangpur: {
          id: 'Rangpur',
          name: 'Rangpur',
          nameBn: 'রংপুর',
          upazilas: [
            { id: 'Rangpur_Sadar', name: 'Rangpur Sadar', nameBn: 'রংপুর সদর' },
            { id: 'Badarganj', name: 'Badarganj', nameBn: 'বদরগঞ্জ' },
          ],
        },
      },
    },
    Mymensingh: {
      id: 'Mymensingh',
      name: 'Mymensingh',
      nameBn: 'ময়মনসিংহ',
      districts: {
        Mymensingh: {
          id: 'Mymensingh',
          name: 'Mymensingh',
          nameBn: 'ময়মনসিংহ',
          upazilas: [
            { id: 'Mymensingh_Sadar', name: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর' },
            { id: 'Trishal', name: 'Trishal', nameBn: 'ত্রিশাল' },
          ],
        },
      },
    },
  },
}

/**
 * Returns list of divisions for a country
 */
export function getDivisions(countryCode = 'BD'): GeographicLevel[] {
  if (countryCode !== 'BD') return []
  return Object.values(BANGLADESH_GEOGRAPHY.divisions).map((d) => ({
    id: d.id,
    name: d.name,
    nameBn: d.nameBn,
  }))
}

export const BANGLADESH_DIVISIONS: GeographicLevel[] = getDivisions('BD')

/**
 * Returns list of districts for a given division
 */
export function getDistrictsForDivision(divisionId: string, countryCode = 'BD'): GeographicLevel[] {
  if (countryCode !== 'BD') return []
  const division = BANGLADESH_GEOGRAPHY.divisions[divisionId]
  if (!division) return []
  return Object.values(division.districts).map((d) => ({
    id: d.id,
    name: d.name,
    nameBn: d.nameBn,
  }))
}

/**
 * Returns list of upazilas for a given district
 */
export function getUpazilasForDistrict(
  districtId: string,
  divisionId?: string,
  countryCode = 'BD'
): GeographicLevel[] {
  if (countryCode !== 'BD') return []

  if (divisionId) {
    const div = BANGLADESH_GEOGRAPHY.divisions[divisionId]
    const dist = div?.districts[districtId]
    return dist?.upazilas || []
  }

  // If division not specified, search across all divisions
  for (const div of Object.values(BANGLADESH_GEOGRAPHY.divisions)) {
    const dist = div.districts[districtId]
    if (dist) {
      return dist.upazilas
    }
  }

  return []
}

/**
 * Validates whether the supplied geographic hierarchy relationships are consistent and valid.
 */
export function validateGeographicHierarchy(
  countryCode: string,
  division: string,
  district: string,
  upazila?: string | null
): { valid: boolean; error?: string } {
  if (countryCode !== 'BD') {
    return { valid: false, error: `Unsupported country code: ${countryCode}` }
  }

  const divObj = BANGLADESH_GEOGRAPHY.divisions[division]
  if (!divObj) {
    return { valid: false, error: `Invalid division '${division}' for Bangladesh` }
  }

  const distObj = divObj.districts[district]
  if (!distObj) {
    return {
      valid: false,
      error: `District '${district}' does not belong to Division '${division}'`,
    }
  }

  if (upazila) {
    const upaFound = distObj.upazilas.some(
      (u) =>
        u.id.toLowerCase() === upazila.toLowerCase() ||
        u.name.toLowerCase() === upazila.toLowerCase()
    )
    if (!upaFound) {
      return {
        valid: false,
        error: `Upazila '${upazila}' is not recognized under District '${district}'`,
      }
    }
  }

  return { valid: true }
}
