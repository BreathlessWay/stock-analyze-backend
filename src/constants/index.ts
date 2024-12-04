import { join, resolve } from 'node:path';

export const Statics_Folder_Name = 'statics';

export const Statics_Folder_Path = resolve(process.cwd(), Statics_Folder_Name);

export const Template_Folder_Path = resolve(Statics_Folder_Path, 'template');

export const Template_File_Path = join(
  Statics_Folder_Name,
  'template/stock.xlsx',
);

export const Upload_Folder_Path = resolve(Statics_Folder_Path, 'upload');
