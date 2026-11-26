/* Taruh di: lib/projectOrder.ts
   Aturan urutan projek, dipakai oleh halaman utama dan halaman admin.

   - Projek yang sudah diurutkan (sort_order > 0) tampil menurut angkanya.
   - Projek yang BARU ditambahkan (sort_order kosong/0) otomatis masuk tepat di bawah banner,
     yaitu urutan ke-4, supaya tidak mengambil slot sorotan. Yang terbaru di atas.
   - FEATURED = jumlah projek yang tampil di banner. */
export const FEATURED = 3;

type Row = { id: number; sort_order?: number | string | null };

export function orderProjects<T extends Row>(rows: T[]): T[] {
  const n = (r: T) => Number(r.sort_order) || 0;
  const ordered = rows.filter((r) => n(r) > 0).sort((a, b) => n(a) - n(b) || b.id - a.id);
  const fresh = rows.filter((r) => n(r) <= 0).sort((a, b) => b.id - a.id);
  return [...ordered.slice(0, FEATURED), ...fresh, ...ordered.slice(FEATURED)];
}
