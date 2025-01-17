import { resolve } from 'node:path';

export const Statics_Folder_Name = 'statics';

export const Analyze_Result_File_End_Name = '_analyze_result.xlsx';

export const Project_Folder_Path = process.cwd();

export const Statics_Folder_Path = resolve(
  Project_Folder_Path,
  Statics_Folder_Name,
);

export const Template_Folder_Path = resolve(Statics_Folder_Path, 'template');

export const Template_File_Path = resolve(Template_Folder_Path, 'template.zip');

export const Upload_Folder_Path = resolve(Statics_Folder_Path, 'upload');

export const Day_Report_Folder_Path = resolve(
  Statics_Folder_Path,
  'day_report',
);

export const generateDayReportFileName = (date: string) =>
  `jingxiao_T0_star_${date}.xlsx`;

export const DefaultServiceCharge = 4;
