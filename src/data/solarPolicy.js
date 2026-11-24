export const SOLAR_REVIEW_DATE = '24 November 2026'
const root = 'https://nepra.org.pk/Legislation/3-Reg/3.35%20NEPRA%20%20Prosumer%20Regulations%202026/'
export const SOLAR_SOURCES = [
  { label: 'Prosumer Regulations — SRO 251, 9 February 2026', url: root + 'NEPRA%20Prosumer%20Regulations%20(SRO%20251(I)2026)%2009-02-26.PDF' },
  { label: 'Existing-agreement savings — SRO 547, 2 April 2026', url: root + 'S.R.O%20547(1)%202026%20notification%20amendment%20in%20NEPRA%20(Prosumer)%20Regulations%2002-04-2026.PDF' },
  { label: 'Authority concurrence fee — SRO 709, 28 April 2026', url: root + 'SRO%20709%20-%20Fee%20for%20Prosumers%2028-04-2026.PDF' },
  { label: 'Approval for facilities up to 25 kW — SRO 1330, 6 August 2026', url: root + 'SRO%201330(I)-2026%20Dated%2006-08-2026.pdf' },
]
export const SOLAR_POLICY_NOTES = [
  'The 9 February 2026 regulations introduced net billing: imports at the applicable tariff and exports at the national average energy purchase price. This calculator does not supply a current numeric export rate; confirm the applicable rate before entering it. Regulation 14 allows excess billed credit to carry to the next cycle or be paid quarterly; credit is not guaranteed same-month cash.',
  'The 2 April amendment preserves the old rate and billing mechanism for valid pre-commencement agreements until expiry, subject to its material-modification exception. It is deemed effective from 9 February 2026. This tool does not model that legacy billing mechanism.',
  'The 28 April fee notification, effective from 9 February 2026, sets the Authority concurrence fee at nil up to 25 kW and PKR 1,000/kW above 25 kW. The 6 August amendment removes Authority concurrence for facilities of 25 kW or below, with approval by the concerned licensee. Meter, interconnection and other applicable charges remain separate; use a written estimate.',
  'Regulations 5 and 13 allow bidirectional metering using one meter or two meters. Regulation 12 permits direct procurement when licensee meters are unavailable, subject to licensee testing. Confirm the approved equipment and process; a universal separate-meter or private-purchase ban is not assumed.',
]
