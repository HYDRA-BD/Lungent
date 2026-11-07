/**
 * Phase 2.12: Generalized International Geographic Hierarchy Service
 * Manages flexible multi-tier administrative structures across different countries
 * (Level 1: Division/State, Level 2: District/County, Level 3: Upazila/Municipality).
 */

import type { CountryGeographicNode } from '../types'

export const SAMPLE_GEOGRAPHIC_NODES: CountryGeographicNode[] = [
  // Bangladesh (Level 1 = Division, Level 2 = District, Level 3 = Upazila)
  {
    id: 'geo-bd-div-dhaka',
    countryCode: 'BD',
    nodeCode: 'BD-DIV-DHAKA',
    nameEn: 'Dhaka Division',
    nameNative: 'ঢাকা বিভাগ',
    level: 1,
    parentNodeCode: null,
    latitude: 23.8103,
    longitude: 90.4125,
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'geo-bd-dist-gazipur',
    countryCode: 'BD',
    nodeCode: 'BD-DIST-GAZIPUR',
    nameEn: 'Gazipur District',
    nameNative: 'গাজীপুর জেলা',
    level: 2,
    parentNodeCode: 'BD-DIV-DHAKA',
    latitude: 23.9999,
    longitude: 90.4203,
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'geo-bd-upz-sreepur',
    countryCode: 'BD',
    nodeCode: 'BD-UPZ-SREEPUR',
    nameEn: 'Sreepur Upazila',
    nameNative: 'শ্রীপুর উপজেলা',
    level: 3,
    parentNodeCode: 'BD-DIST-GAZIPUR',
    latitude: 24.2014,
    longitude: 90.4683,
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },

  // Malaysia Synthetic Example (Level 1 = State, Level 2 = District, Level 3 = Municipality)
  {
    id: 'geo-my-st-selangor',
    countryCode: 'MY',
    nodeCode: 'MY-ST-SELANGOR',
    nameEn: 'Selangor State',
    nameNative: 'Negeri Selangor',
    level: 1,
    parentNodeCode: null,
    latitude: 3.0738,
    longitude: 101.5183,
    isActive: true,
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
  {
    id: 'geo-my-dist-petaling',
    countryCode: 'MY',
    nodeCode: 'MY-DIST-PETALING',
    nameEn: 'Petaling District',
    nameNative: 'Daerah Petaling',
    level: 2,
    parentNodeCode: 'MY-ST-SELANGOR',
    latitude: 3.1073,
    longitude: 101.6067,
    isActive: true,
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
  {
    id: 'geo-my-mun-shahalam',
    countryCode: 'MY',
    nodeCode: 'MY-MUN-SHAHALAM',
    nameEn: 'Shah Alam City Council',
    nameNative: 'Majlis Bandaraya Shah Alam',
    level: 3,
    parentNodeCode: 'MY-DIST-PETALING',
    latitude: 3.0733,
    longitude: 101.5185,
    isActive: true,
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
]

export class InternationalGeographicService {
  private static nodes: Map<string, CountryGeographicNode> = new Map(
    SAMPLE_GEOGRAPHIC_NODES.map(n => [n.nodeCode, { ...n }])
  )

  /**
   * Retrieves all geographic nodes for a given country
   */
  public static getNodesForCountry(countryCode: string): CountryGeographicNode[] {
    const normalized = countryCode.trim().toUpperCase()
    return Array.from(this.nodes.values()).filter(n => n.countryCode === normalized && n.isActive)
  }

  /**
   * Retrieves nodes at a specific administrative level (1, 2, or 3)
   */
  public static getNodesByLevel(countryCode: string, level: number): CountryGeographicNode[] {
    return this.getNodesForCountry(countryCode).filter(n => n.level === level)
  }

  /**
   * Retrieves child administrative nodes under a parent node code
   */
  public static getChildNodes(parentNodeCode: string): CountryGeographicNode[] {
    return Array.from(this.nodes.values()).filter(
      n => n.parentNodeCode === parentNodeCode && n.isActive
    )
  }

  /**
   * Registers a new geographic node
   */
  public static registerNode(node: CountryGeographicNode): CountryGeographicNode {
    this.nodes.set(node.nodeCode, node)
    return node
  }
}

