/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AICamera {
  id: string;
  district: string;
  locationName: string;
  roadName: string;
  lat: number;
  lng: number;
  speedLimitTwoWheeler: number; // in km/h
  speedLimitFourWheeler: number; // in km/h
  violationsChecked: string[];
  description: string;
}

export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod"
];

// Curated database of major MVD AI Camera locations in Kerala
export const KERALA_AI_CAMERAS: AICamera[] = [
  // Thiruvananthapuram
  {
    id: "tvm-01",
    district: "Thiruvananthapuram",
    locationName: "Kowdiar Junction",
    roadName: "Kowdiar Avenue",
    lat: 8.5244,
    lng: 76.9614,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Speeding"],
    description: "Located near Kowdiar Palace gate. High-surveillance VIP zone."
  },
  {
    id: "tvm-02",
    district: "Thiruvananthapuram",
    locationName: "Pattom Junction",
    roadName: "MC Road (SH 1)",
    lat: 8.5201,
    lng: 76.9430,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Extremely busy intersection in the heart of Trivandrum city."
  },
  {
    id: "tvm-03",
    district: "Thiruvananthapuram",
    locationName: "Kazhakkoottam Bypass",
    roadName: "NH 66 Bypass",
    lat: 8.5684,
    lng: 76.8732,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 90,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Positioned near the Technopark flyover. Catches speeding violations."
  },
  {
    id: "tvm-04",
    district: "Thiruvananthapuram",
    locationName: "East Fort",
    roadName: "MG Road",
    lat: 8.4828,
    lng: 76.9458,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 40,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "High-density pedestrian and bus zone. Strict speed limits."
  },
  {
    id: "tvm-05",
    district: "Thiruvananthapuram",
    locationName: "Enchakkal Junction",
    roadName: "NH 66 Bypass",
    lat: 8.4795,
    lng: 76.9272,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Seatbelt", "Speeding", "Mobile Use"],
    description: "Major entry point from Kovalam bypass towards the city."
  },
  {
    id: "tvm-06",
    district: "Thiruvananthapuram",
    locationName: "Venjaramoodu Town",
    roadName: "MC Road (SH 1)",
    lat: 8.6806,
    lng: 76.9150,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Located near Venjaramoodu Junction checking inter-district travelers."
  },
  {
    id: "tvm-07",
    district: "Thiruvananthapuram",
    locationName: "Neyyattinkara Town",
    roadName: "Kanyakumari Highway (NH 66)",
    lat: 8.4034,
    lng: 77.0858,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Near Neyyattinkara General Hospital. Highly congested route."
  },

  // Kollam
  {
    id: "klm-01",
    district: "Kollam",
    locationName: "Chinnakada Junction",
    roadName: "Town Hall Road",
    lat: 8.8872,
    lng: 76.5888,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Located near the historic Chinnakada Clock Tower."
  },
  {
    id: "klm-02",
    district: "Kollam",
    locationName: "Kottarakara Junction",
    roadName: "MC Road (SH 1)",
    lat: 8.9986,
    lng: 76.7801,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Major junction intersecting MC Road and National Highway 183."
  },
  {
    id: "klm-03",
    district: "Kollam",
    locationName: "Ayathil Bypass",
    roadName: "Kollam Bypass (NH 66)",
    lat: 8.8833,
    lng: 76.6212,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Located on the newly built Kollam Bypass high-speed section."
  },
  {
    id: "klm-04",
    district: "Kollam",
    locationName: "Karunagappally North",
    roadName: "Kollam-Alappuzha Highway (NH 66)",
    lat: 9.0536,
    lng: 76.5350,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Helmet", "Seatbelt", "Speeding"],
    description: "Active camera checking fast vehicles approaching Karunagappally town."
  },

  // Pathanamthitta
  {
    id: "pta-01",
    district: "Pathanamthitta",
    locationName: "Thiruvalla Town",
    roadName: "MC Road (SH 1)",
    lat: 9.3845,
    lng: 76.5786,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Installed near Thiruvalla private bus stand junction."
  },
  {
    id: "pta-02",
    district: "Pathanamthitta",
    locationName: "Adoor Central Junction",
    roadName: "Kayamkulam-Pathanapuram Road",
    lat: 9.1561,
    lng: 76.7328,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Critical node linking Adoor bypass and the main MC road bypass."
  },
  {
    id: "pta-03",
    district: "Pathanamthitta",
    locationName: "Pathanamthitta Ring Road",
    roadName: "Ring Road Bypass",
    lat: 9.2642,
    lng: 76.7872,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Near civil station entrance checking local city traffic."
  },

  // Alappuzha
  {
    id: "alp-01",
    district: "Alappuzha",
    locationName: "Kayamkulam Town",
    roadName: "Kayamkulam-Punalur Road (NH 66)",
    lat: 9.1722,
    lng: 76.5003,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Monitoring vehicles exiting Kayamkulam town toward Kollam."
  },
  {
    id: "alp-02",
    district: "Alappuzha",
    locationName: "Alappuzha YMCA Junction",
    roadName: "Vellakinar Road",
    lat: 9.4921,
    lng: 76.3382,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "High compliance zone inside the busy Alappuzha beach tourist artery."
  },
  {
    id: "alp-03",
    district: "Alappuzha",
    locationName: "Cherthala KSRTC Junction",
    roadName: "NH 66 Bypass",
    lat: 9.6845,
    lng: 76.3361,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Checking vehicles rushing from Ernakulam to Alappuzha highway stretch."
  },
  {
    id: "alp-04",
    district: "Alappuzha",
    locationName: "Ambalappuzha Junction",
    roadName: "National Highway 66",
    lat: 9.3789,
    lng: 76.3636,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Helmet", "Seatbelt", "Speeding"],
    description: "Near the famous Ambalappuzha Temple road entrance on NH 66."
  },

  // Kottayam
  {
    id: "ktm-01",
    district: "Kottayam",
    locationName: "Kanjikuzhy Junction",
    roadName: "KK Road (NH 183)",
    lat: 9.5888,
    lng: 76.5452,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Highly active camera checking traffic headed to Kumily and Idukki."
  },
  {
    id: "ktm-02",
    district: "Kottayam",
    locationName: "Changanassery Bypass",
    roadName: "MC Road Bypass",
    lat: 9.4445,
    lng: 76.5414,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Seatbelt", "Helmet", "Speeding"],
    description: "Installed on the wide, traffic-prone Changanassery bypass road."
  },
  {
    id: "ktm-03",
    district: "Kottayam",
    locationName: "Ettumanoor Church Gate",
    roadName: "MC Road (SH 1)",
    lat: 9.6672,
    lng: 76.5684,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Directly opposite the Ettumanoor junction near Mahadeva Temple."
  },
  {
    id: "ktm-04",
    district: "Kottayam",
    locationName: "Pala Town",
    roadName: "Pala-Thodupuzha Road",
    lat: 9.7092,
    lng: 76.6811,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Active surveillance monitoring city traffic and campus student commuters."
  },

  // Idukki
  {
    id: "idk-01",
    district: "Idukki",
    locationName: "Thodupuzha Town",
    roadName: "Muvattupuzha Road",
    lat: 9.8978,
    lng: 76.7114,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Located near Thodupuzha Private Bus Terminal entry highway."
  },
  {
    id: "idk-02",
    district: "Idukki",
    locationName: "Adimali Town",
    roadName: "Kochi-Munnar Highway (NH 85)",
    lat: 10.0136,
    lng: 76.9536,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Checks tourist vehicles ascending hills toward Munnar hill station."
  },
  {
    id: "idk-03",
    district: "Idukki",
    locationName: "Munnar Town Entrance",
    roadName: "Kochi-Dhanushkodi Road (NH 85)",
    lat: 10.0889,
    lng: 77.0597,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 40,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Installed in Munnar tea valley entrance. Heavy tourist check zone."
  },

  // Ernakulam
  {
    id: "ekm-01",
    district: "Ernakulam",
    locationName: "Vytila Junction (Bypass)",
    roadName: "Ernakulam Bypass (NH 66)",
    lat: 9.9672,
    lng: 76.3214,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Seatbelt", "Helmet", "Mobile Use", "Triple Riding"],
    description: "One of Kerala's busiest nodes. High resolution multilane tracking."
  },
  {
    id: "ekm-02",
    district: "Ernakulam",
    locationName: "Edappally Toll",
    roadName: "NH 544 (Kochi-Salem Highway)",
    lat: 10.0252,
    lng: 76.3114,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Positioned right near LuLu Mall entry flyover lanes."
  },
  {
    id: "ekm-03",
    district: "Ernakulam",
    locationName: "Kakkanad Civil Line",
    roadName: "Kakkanad-Palarivattom Road",
    lat: 10.0152,
    lng: 76.3414,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Main road checking Infopark IT professionals and Civil Station visitors."
  },
  {
    id: "ekm-04",
    district: "Ernakulam",
    locationName: "Aluva Flyover End",
    roadName: "NH 544",
    lat: 10.1089,
    lng: 76.3536,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Checking fast commuter flows crossing the Periyar bridge."
  },
  {
    id: "ekm-05",
    district: "Ernakulam",
    locationName: "Marine Drive Bypass",
    roadName: "Shanmugham Road",
    lat: 9.9782,
    lng: 76.2758,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Active waterfront tourist road. Highly populated pedestrian zone."
  },
  {
    id: "ekm-06",
    district: "Ernakulam",
    locationName: "Angamaly North Junction",
    roadName: "NH 544",
    lat: 10.1982,
    lng: 76.3861,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Helmet"],
    description: "Important checkpost on the Thrissur-Kochi highway border."
  },
  {
    id: "ekm-07",
    district: "Ernakulam",
    locationName: "Kundannoor Junction",
    roadName: "NH 66 Bypass",
    lat: 9.9367,
    lng: 76.3150,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Seatbelt", "Speeding", "Mobile Use"],
    description: "Major heavy vehicle routing corridor heading to Cochin Port."
  },

  // Thrissur
  {
    id: "tsr-01",
    district: "Thrissur",
    locationName: "Swaraj Round East",
    roadName: "Swaraj Round Ring",
    lat: 10.5250,
    lng: 76.2144,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 40,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Encircles Vadakkunnathan Temple. Highly enforced circular one-way lane."
  },
  {
    id: "tsr-02",
    district: "Thrissur",
    locationName: "Mannuthy Bypass Junction",
    roadName: "NH 544 Bypass",
    lat: 10.5312,
    lng: 76.2589,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 90,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Installed on NH 544 near Mannuthy agricultural campus crossing."
  },
  {
    id: "tsr-03",
    district: "Thrissur",
    locationName: "Kunnamkulam Junction",
    roadName: "Pattambi Road",
    lat: 10.6482,
    lng: 76.0714,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Famous high-traffic node inside Kunnamkulam commercial town."
  },
  {
    id: "tsr-04",
    district: "Thrissur",
    locationName: "Chalakudy Highway Gate",
    roadName: "NH 544",
    lat: 10.3089,
    lng: 76.3350,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Checking travelers heading between Thrissur city and Nedumbassery."
  },

  // Palakkad
  {
    id: "pkd-01",
    district: "Palakkad",
    locationName: "Chandranagar Bypass",
    roadName: "Coimbatore Road (NH 544)",
    lat: 10.7714,
    lng: 76.6712,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 90,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Major checkpoint near Walayar border bypass heading to Tamil Nadu."
  },
  {
    id: "pkd-02",
    district: "Palakkad",
    locationName: "Ottapalam Town",
    roadName: "Palakkad-Kulappully Road",
    lat: 10.7761,
    lng: 76.3811,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Installed near Ottapalam court road junction."
  },
  {
    id: "pkd-03",
    district: "Palakkad",
    locationName: "Mannarkkad Junction",
    roadName: "NH 966 (Palakkad-Kozhikode Road)",
    lat: 10.9882,
    lng: 76.4389,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Checks high speed heavy vehicles in Palakkad foothills corridor."
  },

  // Malappuram
  {
    id: "mpm-01",
    district: "Malappuram",
    locationName: "Perinthalmanna Bypass",
    roadName: "Palakkad-Kozhikode Highway (NH 966)",
    lat: 10.9782,
    lng: 76.2236,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Busy healthcare hub junction in Malappuram. Active double direction cameras."
  },
  {
    id: "mpm-02",
    district: "Malappuram",
    locationName: "Manjeri Kacherippadi",
    roadName: "Manjeri-Nilambur Road",
    lat: 11.1189,
    lng: 76.1182,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Central junction in Manjeri checking local city and commercial traffic."
  },
  {
    id: "mpm-03",
    district: "Malappuram",
    locationName: "Kottakkal Changuvetty",
    roadName: "Calicut Highway (NH 66)",
    lat: 11.0022,
    lng: 75.9989,
    speedLimitTwoWheeler: 55,
    speedLimitFourWheeler: 75,
    violationsChecked: ["Speeding", "Seatbelt", "Helmet", "Mobile Use"],
    description: "Positioned near Kottakkal Arya Vaidya Sala main junction."
  },
  {
    id: "mpm-04",
    district: "Malappuram",
    locationName: "Malappuram Town (Kottappadi)",
    roadName: "Town Bypass",
    lat: 11.0736,
    lng: 76.0722,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Directly monitoring active student zones and bus stand bypass."
  },

  // Kozhikode
  {
    id: "kkd-01",
    district: "Kozhikode",
    locationName: "Thondayad Bypass Junction",
    roadName: "Kozhikode Bypass (NH 66)",
    lat: 11.2612,
    lng: 75.8114,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 85,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Crucial bypass interchange checking speeding and heavy truck lanes."
  },
  {
    id: "kkd-02",
    district: "Kozhikode",
    locationName: "Ramanattukara Highway",
    roadName: "NH 66 (Calicut-Thrissur highway)",
    lat: 11.1736,
    lng: 75.8612,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Helmet", "Seatbelt", "Speeding"],
    description: "Southern entry node of Kozhikode bypass. Active 24/7."
  },
  {
    id: "kkd-03",
    district: "Kozhikode",
    locationName: "Mavoor Road KSRTC Terminal",
    roadName: "Mavoor Road",
    lat: 11.2536,
    lng: 75.7912,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Near the new high-rise KSRTC terminal. Constant police and AI coverage."
  },
  {
    id: "kkd-04",
    district: "Kozhikode",
    locationName: "Vadakara Highway Stretch",
    roadName: "National Highway 66",
    lat: 11.6034,
    lng: 75.5912,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Speeding", "Seatbelt", "Helmet"],
    description: "Checking long distance inter-state traveler speeds."
  },

  // Wayanad
  {
    id: "wyd-01",
    district: "Wayanad",
    locationName: "Kalpetta Civil Station",
    roadName: "Calicut-Mysore Highway (NH 766)",
    lat: 11.6089,
    lng: 76.0858,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Monitoring highway traffic crossing the Wayanad district headquarters."
  },
  {
    id: "wyd-02",
    district: "Wayanad",
    locationName: "Sulthan Bathery Town",
    roadName: "Mysore Highway (NH 766)",
    lat: 11.6667,
    lng: 76.2667,
    speedLimitTwoWheeler: 40,
    speedLimitFourWheeler: 40,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Installed in clean-city limits. Absolute zero tolerance for violations."
  },
  {
    id: "wyd-03",
    district: "Wayanad",
    locationName: "Lakkidi Ghat Road View Point",
    roadName: "Thamarassery Churam (NH 766)",
    lat: 11.5122,
    lng: 76.0245,
    speedLimitTwoWheeler: 30,
    speedLimitFourWheeler: 30,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "At the exit of 9 hairpin curves. Critical speed limits for heavy descend."
  },

  // Kannur
  {
    id: "knr-01",
    district: "Kannur",
    locationName: "Caltex Junction",
    roadName: "National Highway 66",
    lat: 11.8789,
    lng: 75.3712,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Directly opposite the Collectorate gate and government offices."
  },
  {
    id: "knr-02",
    district: "Kannur",
    locationName: "Thalassery New Bus Stand",
    roadName: "NH 66 Bypass Road",
    lat: 11.7512,
    lng: 75.4912,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use"],
    description: "Vibrant junction monitoring north-bound highway coaches."
  },
  {
    id: "knr-03",
    district: "Kannur",
    locationName: "Taliparamba South",
    roadName: "National Highway 66",
    lat: 12.0445,
    lng: 75.3582,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 70,
    violationsChecked: ["Helmet", "Seatbelt", "Speeding"],
    description: "Checking vehicles entering Taliparamba municipal highway limit."
  },

  // Kasaragod
  {
    id: "ksd-01",
    district: "Kasaragod",
    locationName: "Kasaragod Town Junction",
    roadName: "Kanhangad State Highway",
    lat: 12.4982,
    lng: 74.9889,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 50,
    violationsChecked: ["Helmet", "Seatbelt", "Mobile Use", "Triple Riding"],
    description: "Centrally positioned near the Municipal Office complex."
  },
  {
    id: "ksd-02",
    district: "Kasaragod",
    locationName: "Kanhangad Main Road",
    roadName: "Kanhangad Bypass",
    lat: 12.3114,
    lng: 75.0934,
    speedLimitTwoWheeler: 50,
    speedLimitFourWheeler: 60,
    violationsChecked: ["Helmet", "Seatbelt", "Triple Riding"],
    description: "Surveillance covering local heavy traffic and shopping zones."
  },
  {
    id: "ksd-03",
    district: "Kasaragod",
    locationName: "Uppala Highway Junction",
    roadName: "NH 66 (Kasaragod-Mangalore route)",
    lat: 12.6845,
    lng: 74.9012,
    speedLimitTwoWheeler: 60,
    speedLimitFourWheeler: 80,
    violationsChecked: ["Speeding", "Seatbelt", "Mobile Use"],
    description: "Near Karnataka border checkpost. Captures speeding interstate vehicles."
  }
];

// Helper to calculate distance in meters between two lat/lng coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}
