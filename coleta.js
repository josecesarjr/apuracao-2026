// Coleta uma amostra da apuração no TSE e acrescenta ao histórico do repositório.
// Roda no GitHub Actions (.github/workflows/snapshot.yml). O TSE só publica a
// foto do momento; o gráfico de evolução precisa de alguém guardando as fotos.
const fs = require("node:fs");
const path = require("node:path");

const ELE = "6258", CICLO = "ele2026";
const E6 = "e" + ("000000" + ELE).slice(-6);
const BASE = `https://resultados.tse.jus.br/oficial/${CICLO}/${ELE}`;
const UFS = ["ac","al","ap","am","ba","ce","df","es","go","ma","mt","ms","mg",
             "pa","pb","pr","pe","pi","rj","rn","rs","ro","rr","sc","sp","se","to"];
const ALVOS = ["br"].concat(UFS).concat(["zz"]);

function payload(txt) {
  let b = txt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  b += "====".slice(0, (4 - b.length % 4) % 4);
  return JSON.parse(Buffer.from(b, "base64").toString("utf8"));
}
const n = (v) => parseInt(v, 10) || 0;

function resumo(d) {
  const carg = (d.carg || [])[0] || {};
  const por = {};
  (carg.agr || []).forEach((a) => (a.par || []).forEach((p) =>
    (p.cand || []).forEach((c) => { por[c.n] = n(c.vap); })));
  const s = d.s || {}, e = d.e || {}, v = d.v || {};
  return {
    v13: por["13"] || 0,
    v22: por["22"] || 0,
    vv: n(v.vv),
    st: n(s.st), ts: n(s.ts),
    est: n(e.est), te: n(e.te)
  };
}

async function uma(uf) {
  const u = `${BASE}/dados/${uf}/${uf}-c0001-${E6}-u.jws?t=${Date.now()}`;
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${uf}: HTTP ${r.status}`);
  const d = payload(await r.text());
  return { resumo: resumo(d), dg: d.dg, hg: d.hg };
}

(async () => {
  const amostra = { t: new Date().toISOString(), tse: "", por: {} };
  for (const uf of ALVOS) {
    try {
      const r = await uma(uf);
      amostra.por[uf] = r.resumo;
      if (uf === "br") amostra.tse = r.dg + " " + r.hg;
    } catch (e) {
      console.log("falhou", uf, e.message);
    }
  }
  const alvo = path.join("dados", "historico.json");
  fs.mkdirSync("dados", { recursive: true });
  let hist = [];
  try { hist = JSON.parse(fs.readFileSync(alvo, "utf8")); } catch (e) { hist = []; }
  // Nada totalizado ainda e já existe uma amostra igual: não suja o histórico.
  const ult = hist[hist.length - 1];
  const igual = ult && JSON.stringify(ult.por) === JSON.stringify(amostra.por);
  if (igual) { console.log("sem mudança desde a última amostra"); return; }
  hist.push(amostra);
  fs.writeFileSync(alvo, JSON.stringify(hist), "utf8");
  console.log("amostras no histórico:", hist.length, "| TSE", amostra.tse);
})();
