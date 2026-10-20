import { TripPlan, TravelStyle } from '../types/community';
import { Destination } from '../types';

export const CURATED_TRIP_PLANS: TripPlan[] = [
  {
    id: 'curated_1day_garo_hills',
    title: '১-দিনের গারো পাহাড় ও মধুটিলা নিসর্গ সফর',
    description: 'ঢাকা বা আশপাশের জেলা থেকে ভোরে রওনা দিয়ে একদিনেই শেরপুরের প্রধান দুটি পাহাড় ও পার্ক ঘুরে আসার সম্পূর্ণ পরিকল্পনা।',
    durationDays: 1,
    travelStyle: 'family',
    estimatedBudgetTotal: 1850,
    destinationIds: ['madhutila-eco-park', 'ghajni-abakash-center'],
    highlights: [
      'মধুটিলা ওয়াচ টাওয়ার থেকে মেঘালয় ভিউ',
      'শালবনের ছায়াময় ট্রেইল ও কৃত্রিম হ্রদে নৌকাভ্রমণ',
      'গজনী অবকাশের সুড়ঙ্গ পথ ও গারো পাহাড়ের সূর্যাস্ত',
    ],
    budgetBreakdown: {
      transport: 1000,
      accommodation: 0,
      food: 550,
      entryAndActivities: 150,
      emergency: 150,
    },
    itineraryDays: [
      {
        day: 1,
        title: 'গারো পাহাড়ের সবুজ উপত্যকা ও ইকো পার্ক ভ্রমণ',
        destinationIds: ['madhutila-eco-park', 'ghajni-abakash-center'],
        travelNotes: 'ভোর ৬টায় ঢাকার মহাখালী থেকে বাসে উঠে সকাল ১০:৩০টায় শেরপুর সদরে পৌঁছান। সেখান থেকে সিএনজি নিয়ে প্রথমে মধুটিলা ইকো পার্কে যান। দুপুর ১:৩০টায় স্থানীয় রেস্তোরাঁয় লাঞ্চ সেরে আড়াইটায় গজনী অবকাশ কেন্দ্রের দিকে রওনা দিন। বিকেল ৪:৩০টা থেকে সূর্যাস্ত পর্যন্ত গজনীর পাহাড়ে সময় কাটিয়ে সন্ধ্যা ৭টায় শেরপুর শহর থেকে ফিরতি বাসে উঠুন।',
        estimatedCost: 1850,
      },
    ],
    isCurated: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'curated_2days_complete_sherpur',
    title: '২-দিনের পূর্ণাঙ্গ শেরপুর পাহাড়, ট্র্যাকিং ও সংস্কৃতি',
    description: 'শেরপুরের পাহাড়, বন, সীমান্তবর্তী নদী এবং আদিবাসী সংস্কৃতি নিবিড়ভাবে উপভোগ করার ২ দিন ১ রাতের সম্পূর্ণ ট্যুর।',
    durationDays: 2,
    travelStyle: 'friends',
    estimatedBudgetTotal: 3800,
    destinationIds: [
      'madhutila-eco-park',
      'ghajni-abakash-center',
      'rajar-pahar-sreebardi',
      'baromari-mission',
    ],
    highlights: [
      'শ্রীবরদীর ৪৫০ ফুট উঁচু রাজার পাহাড়ে হাইকিং',
      'বারোমারী মিশনে আদিবাসী ঐতিহ্য ও ওয়াংগালা সংস্কৃতি',
      'শেরপুর সদরের ঐতিহ্যবাহী ছানামুখী ও মিষ্টির স্বাদ গ্রহণ',
      'মধুটিলা ও গজনী অবকাশের পূর্ণ নিসর্গ দর্শন',
    ],
    budgetBreakdown: {
      transport: 1500,
      accommodation: 1000,
      food: 800,
      entryAndActivities: 250,
      emergency: 250,
    },
    itineraryDays: [
      {
        day: 1,
        title: 'দিন ১: মধুটিলা ও বারোমারী আদিবাসী অঞ্চল',
        destinationIds: ['madhutila-eco-park', 'baromari-mission'],
        travelNotes: 'সকালে শেরপুর পৌঁছে নালিতাবাড়ীর মধুটিলা ইকো পার্ক ও সীমান্তবর্তী বারোমারী খ্রিস্টান মিশন ঘুরে দেখুন। রাতে শেরপুর সদর শহরে মানসম্মত হোটেলে রাত্রিযাপন।',
        estimatedCost: 2000,
      },
      {
        day: 2,
        title: 'দিন ২: রাজার পাহাড় হাইকিং ও গজনী অবকাশ',
        destinationIds: ['rajar-pahar-sreebardi', 'ghajni-abakash-center'],
        travelNotes: 'সকালে শ্রীবরদীর রাজার পাহাড়ে ট্র্যাকিং। দুপুরে ঝিনাইগাতীর গজনী অবকাশে সূর্যাস্ত ও বিকেলে কেনাকাটা শেষে রাতে ঢাকার উদ্দেশ্যে রওনা।',
        estimatedCost: 1800,
      },
    ],
    isCurated: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'curated_1day_heritage_trail',
    title: '১-দিনের প্রত্নতাত্ত্বিক ও ঐতিহাসিক স্থাপত্য ট্রেইল',
    description: 'শেরপুরের প্রাচীন মসজিদ, জমিদার বাড়ি ও লোকজ ইতিহাসের স্মৃতিচিহ্ন আবিষ্কারের ১ দিনের সাংস্কৃতিক সফর।',
    durationDays: 1,
    travelStyle: 'solo',
    estimatedBudgetTotal: 1200,
    destinationIds: ['maisani-mosque', 'noyani-zamindar-bari', 'gar-jaripa'],
    highlights: [
      'পৌনে তিনশত বছরের প্রাচীন মাইসানী জামে মসজিদ',
      'নয়ানী জমিদার বাড়ির রাজকীয় তোরণ ও ভবন',
      'গড়জরিপা ঐতিহাসিক দুর্গ ও কালিদাস পণ্ডিতের ভিটা',
    ],
    budgetBreakdown: {
      transport: 600,
      accommodation: 0,
      food: 400,
      entryAndActivities: 50,
      emergency: 150,
    },
    itineraryDays: [
      {
        day: 1,
        title: 'শেরপুর সদর ও নকলা অঞ্চলের ঐতিহ্য দর্শন',
        destinationIds: ['maisani-mosque', 'noyani-zamindar-bari', 'gar-jaripa'],
        travelNotes: 'সকালে শেরপুর সদর শহরের নয়ানী জমিদার বাড়ি ও ডিসি পার্ক। দুপুরে নকলা রোডে মাইসানী মসজিদ ও ঐতিহাসিক গড়জরিপা তোরণ।',
        estimatedCost: 1200,
      },
    ],
    isCurated: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

/**
 * Calculates estimated budget based on selected destination count, days, and style
 */
export function calculateCustomTripBudget(
  destinations: Destination[],
  durationDays: number,
  style: TravelStyle
): {
  total: number;
  breakdown: TripPlan['budgetBreakdown'];
} {
  // Realistic base estimates for Sherpur District travel:
  const baseTransportPerDay = style === 'budget' ? 350 : style === 'family' ? 900 : 600;
  const baseFoodPerDay = style === 'budget' ? 300 : style === 'family' ? 600 : 450;
  const baseHotelPerNight =
    durationDays > 1 ? (style === 'budget' ? 600 : style === 'family' ? 1400 : 900) : 0;

  const totalTransport = baseTransportPerDay * durationDays + 700; // Bus + internal CNG
  const totalFood = baseFoodPerDay * durationDays;
  const totalHotel = baseHotelPerNight * (durationDays - 1);
  const totalEntry = destinations.length * 30;
  const emergency = Math.round((totalTransport + totalFood + totalHotel) * 0.1);

  const total = totalTransport + totalFood + totalHotel + totalEntry + emergency;

  return {
    total,
    breakdown: {
      transport: totalTransport,
      accommodation: totalHotel,
      food: totalFood,
      entryAndActivities: totalEntry,
      emergency,
    },
  };
}

export function saveUserCustomTrip(plan: TripPlan): void {
  try {
    const key = 'sherpur_user_saved_trips';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(plan);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

export function getUserSavedTrips(): TripPlan[] {
  try {
    const key = 'sherpur_user_saved_trips';
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}
