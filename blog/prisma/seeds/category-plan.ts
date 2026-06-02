/** Seed kategori dağılımı — her biri 2–5 makale (birincil kategori) */
export const CATEGORY_PLAN = {
  'Web Geliştirme': 5,
  Backend: 3,
  Veritabanı: 3,
  DevOps: 5,
  'Yazılım Mimarisi': 4,
  Güvenlik: 3,
  'Kalite ve Test': 3,
} as const;

export const EXPECTED_TUTORIAL_COUNT = Object.values(CATEGORY_PLAN).reduce(
  (sum, n) => sum + n,
  0
);
