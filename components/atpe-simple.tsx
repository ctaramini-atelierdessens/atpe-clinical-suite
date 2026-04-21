"use client";

export default function AtpeSimple() {
  return (
    <div className="rounded-2xl border p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">
        Dashboard ATPE (test)
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Score global</div>
          <div className="text-2xl font-bold">65</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Niveau</div>
          <div className="text-lg font-semibold">Structuré</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Tendance</div>
          <div className="text-lg">Progression</div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Amélioration de la régulation émotionnelle, engagement corporel en progression,
        symbolisation en émergence.
      </div>
    </div>
  );
}