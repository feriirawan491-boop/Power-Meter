export function periodBounds(month:string){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Periode laporan tidak valid.');
 const [year,number]=month.split('-').map(Number);
 const startAt=Date.parse(`${month}-01T00:00:00+07:00`);
 const nextAt=Date.UTC(year,number,1)-7*60*60*1000;
 return {startAt,nextAt};
}
export function inReportPeriod(at:string,month:string){
 const {startAt,nextAt}=periodBounds(month),time=Date.parse(at);
 return time>=startAt&&time<nextAt;
}
