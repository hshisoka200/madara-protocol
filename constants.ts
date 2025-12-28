
import { Rank, Mission } from './types';

export const TOTAL_PROTOCOL_DAYS = 15;

export const RANK_THRESHOLDS = {
  ACADEMY: 15,
  GENIN: 30,
  CHUNIN: 60,
  LEGEND: 61 // 61+
};

export const MADARA_QUOTES: Record<Rank, { AR: string[]; EN: string[] }> = {
  'Academy Student': {
    AR: [
      "هل تسمي هذا انضباطاً؟ حتى الطفل في الأكاديمية يملك تشاكرا أقوى من إرادتك.",
      "أنت مجرد ظل باهت لشينوبي حقيقي.. أثبت لي أنك تستحق البقاء في هذا الواقع.",
      "الزحف في البداية ضروري، لكن لا تطل المكوث في القاع، فمادارا لا ينتظر الضعفاء.",
      "أيقظ تشاكرا الالتزام لديك، أو انسحب الآن قبل أن يبتلعك ظلام الكسل."
    ],
    EN: [
      "Do you call this discipline? Even an academy student has stronger chakra than your will.",
      "You are but a faint shadow of a true shinobi.. prove you deserve this reality.",
      "Crawling is necessary at first, but don't stay at the bottom; Madara doesn't wait for the weak.",
      "Awaken your commitment chakra, or withdraw before the darkness of laziness consumes you."
    ]
  },
  'Genin / 1-Tomoe': {
    AR: [
      "بدأت الشارينغان الخاصة بك بالدوران.. أرى وميضاً من الجدية في عينيك.",
      "لقد تجاوزت مرحلة العبث، لكنك لا تزال بعيداً عن إدراك جوهر القوة المطلقة.",
      "الانضباط هو سلاحك الجديد، استخدمه لتمزيق أوهام الفشل التي تحيط بك.",
      "ثلاثون يوماً؟ بداية جيدة، لكن تذكر أن الجبال لا تُبنى في ليلة واحدة."
    ],
    EN: [
      "Your Sharingan has begun to spin.. I see a glint of seriousness in your eyes.",
      "You have passed the stage of trifles, but you are still far from grasping absolute power.",
      "Discipline is your new weapon; use it to tear through the illusions of failure.",
      "Thirty days? A good start, but remember mountains aren't built in a single night."
    ]
  },
  'Chunin / Mangekyō': {
    AR: [
      "لقد استيقظت القوة الحقيقية! العالم بدأ يرى واقعك الذي تصنعه بيديك.",
      "مانغيكيو شارينغان.. بصيرتك أصبحت حادة بما يكفي لقطع قيود التسويف.",
      "أنت الآن شينوبي يعتمد عليه، لقد أصبحت جزءاً من النخبة الذين يغيرون القدر.",
      "حتى سوسانو الخاص بك بدأ يتشكل.. لا تدع نيران عزمك تخمد الآن."
    ],
    EN: [
      "True power has awakened! The world begins to see the reality you create with your hands.",
      "Mangekyō Sharingan.. your insight is sharp enough to sever the chains of procrastination.",
      "You are now a reliable shinobi; you have joined the elite who change destiny.",
      "Even your Susanoo is taking shape.. do not let the fires of your resolve die out now."
    ]
  },
  'Eternal Legend / Perfect Susanoo': {
    AR: [
      "أخيراً.. شخص يستحق أن يقف بجانبي. لقد فرضت نظامك على هذا العالم الفوضوي.",
      "سوسانو المثالي! واقعك الآن صلب كالفولاذ، لا يمكن لأي كسل أن يخترقه.",
      "أنت لا تتبع الخطة فحسب، أنت أصبحت الخطة ذاتها.. أنت السيد هنا.",
      "لقد تجاوزت حدود البشر.. الآن، دعنا نُري هذا العالم معنى القوة الأبدية."
    ],
    EN: [
      "Finally.. someone worthy of standing by my side. You have imposed order on this chaotic world.",
      "Perfect Susanoo! Your reality is now as solid as steel; no laziness can pierce it.",
      "You don't just follow the plan; you have become the plan itself.. you are the master here.",
      "You have transcended human limits.. now, let us show this world the meaning of eternal power."
    ]
  }
};

export const DEMOTION_QUOTES: Partial<Record<Rank, string>> = {
  'Academy Student': "أوه.. تهانينا على عودتك لموطنك الأصلي بين الضعفاء. يبدو أنك استسلمت لواقعك الهش بسرعة أكبر مما توقعت.",
  'Genin / 1-Tomoe': "هذا كل شيء؟ تبدأ بقوة ثم تتعثر كطفل يتعلم المشي.. استمر في التعثر، فهذا هو كل ما تجيده حقاً.",
  'Chunin / Mangekyō': "خيبة أمل.. ظننت للحظة أنك قد تكون منافساً يستحق عنائي، لكنك مجرد سحابة صيف عابرة في سمائي."
};

export const INITIAL_MISSIONS: Mission[] = [
  { id: '1', label: 'MORNING TRAINING (CHAKRA FLOW)', completed: false },
  { id: '2', label: 'STRATEGIC STUDY (WARFARE)', completed: false },
  { id: '3', label: 'DEEP WORK (SUSANOO FOCUS)', completed: false },
  { id: '4', label: 'NUTRITION & RECOVERY', completed: false },
  { id: '5', label: 'EVENING REFLECTION', completed: false }
];
