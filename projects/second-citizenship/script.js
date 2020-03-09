var table = document.getElementById("table");
var select = document.getElementById("select");
var textEl = document.getElementById("textEl");
var showDiffEl = document.getElementById("showDiff");
var passports = [];
var countries = [];

var links = {
  "Gambia": "https://www.dualcitizenshipreport.org/dual-citizenship/the-gambia/",
  "Germany": "https://en.wikipedia.org/wiki/German_nationality_law",
  "Singapore": "https://www.ica.gov.sg/PR/citizenship/PR_citizenship_becomeasc",
  "United Arab Emirates": "https://en.wikipedia.org/wiki/Emirati_nationality_law"
}

select.addEventListener("input", updateTable);
showDiffEl.addEventListener("change", updateTable);
/*function(e) {
  for(let i = 0; i < countries.length; i++){
    select.selectedIndex = i;
    updateTable();
  }
  console.log(alls);
});*/


async function main(){
  var data = await fetch("https://cdn.jsdelivr.net/gh/ilyankou/passport-index-dataset@master/passport-index-matrix.csv").then(data => data.text());
  
  var results = Papa.parse(data, {header: true});
  countries = results.meta.fields.splice(1);
  passports = results.data;
  updateSelect();
  updateTable();
}
function updateSelect(){
  var html = "";
  for(let country in countries){
    html += `<option value="${country}">${countries[country]}</option>`;
  }
  select.innerHTML = html;
  html = "";
}
function updateTable(){
  var showDiff = showDiffEl.checked;
  var val = select.value;
  if(passports.length == 0)return;
  var visas = passports[val];
  var visa_ind = [];
  var count = 0;
  for(let visa in visas){
    if(visa == "Passport")continue;
    let dur = parseInt(visas[visa]);
    if(dur < 0)continue;
    let cls = dur > 0 ? "VF" : visas[visa];
    if(cls !== "VF")
      visa_ind.push(visa);
    else
      count++;
  }
  function countDiff(countInd, ind){
    var tVis = passports[countInd];
    return ind.reduce((acc, item) => {
      let cur = tVis[item];
      let dur = parseInt(cur);
      if(dur > 0 || cur == "VF") return acc + 1;
      return acc;
    },0);
  }
  var best = -1;
  var allBests = [];
  for(let cix in countries){
    var cur = countDiff(cix, visa_ind);
    if(best < cur){
      best = cur;
      allBests = [cix];
    }else if (best == cur){
      allBests.push(cix);
    }
  }
  var secCount = 0;
  function normCls(cl){return ((parseInt(cl) > 0) ? "VF" : cl)}
  var best = allBests[0];
  var html = `<thead><th>Countries</th><th>${countries[val]}</th><th>${countries[best]}</th></thead><tbody>`;
  for(let visa in visas){
    if(visa == "Passport")continue;
    let vD = visas[visa];
    let vA = passports[best][visa];
    if(vD < 0 || vA < 0)continue;
    if(showDiff && vD == vA)continue;
    if(normCls(vA) === "VF" && normCls(vD) !== "VF")secCount++;
    html += `<tr><th>${visa}</th>
<td class="${normCls(vD)}">${vD}</td>
<td class="${normCls(vA)}">${vA}</td></tr>`;
  }
  html += "</tbody>";
  textEl.innerHTML = `If you are holder of a passport of <b>${countries[val]}</b> you have visa-free access to <b>${count}</b> countries. If you were to aquire a second citizenship, the most helpful one to you would be <b>${countries[best]}'s</b>. With its citizenship you would gain visa-free access to an additional <b>${secCount}</b> countries. If you would like to know more about becoming a citizen of ${countries[best]}, <a target="_blank" href="${links[countries[best]]}">click here</a>.`;
  table.innerHTML = html;
}
function countVisas(dat){
  return Object.values(dat).reduce((acc, cur) => {
    let dur = parseInt(cur);
    if(dur > 0 || cur == "VF") return acc + 1;
    return acc;
  }, 0)
}
main();