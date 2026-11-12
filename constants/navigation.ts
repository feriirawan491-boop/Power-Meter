export const navigation=['Dashboard','Panels & Meters','Alarms & Events','Energy & Costs','Reports','Settings'] as const;
export type View='Dashboard'|'Panel & Meter'|'Alarm & Gangguan'|'Energi & Biaya'|'Laporan'|'Pengaturan';

export const routes:Record<View,string>={'Dashboard':'/','Panel & Meter':'/meters','Alarm & Gangguan':'/alarms','Energi & Biaya':'/energy/accounting','Laporan':'/reports','Pengaturan':'/settings'};
export const navigationViews:Record<(typeof navigation)[number],View>={'Dashboard':'Dashboard','Panels & Meters':'Panel & Meter','Alarms & Events':'Alarm & Gangguan','Energy & Costs':'Energi & Biaya','Reports':'Laporan','Settings':'Pengaturan'};
export const navigationLabels:Record<View,(typeof navigation)[number]>={Dashboard:'Dashboard','Panel & Meter':'Panels & Meters','Alarm & Gangguan':'Alarms & Events','Energi & Biaya':'Energy & Costs',Laporan:'Reports',Pengaturan:'Settings'};
