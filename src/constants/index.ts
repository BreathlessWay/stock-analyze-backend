import { resolve } from 'node:path';

export const Statics_Folder_Name = 'statics';

export const Project_Folder_Path = process.cwd();

export const Statics_Folder_Path = resolve(
  Project_Folder_Path,
  Statics_Folder_Name,
);

export const Template_Folder_Path = resolve(Statics_Folder_Path, 'template');

export const Template_File_Path = resolve(Template_Folder_Path, 'stock.xlsx');

export const Upload_Folder_Path = resolve(Statics_Folder_Path, 'upload');
