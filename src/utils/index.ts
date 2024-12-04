import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as multer from 'multer';

import { Upload_Folder_Path } from '../constants';

// 3 定义 key 和 iv
const aesKey = 'abcdef0123456789';
const aesIv = '0123456789abcdef';

export const aesEncrypt = (data: string, key = aesKey, iv = aesIv) => {
  // 三个参数：加密的key、加密的iv、需要加密的数据
  // 创建加密对象：三个参数（加密的算法，加密的key，加密的iv）
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

  // 开始加密：三个参数（要加密的数据、加密前的数据类型以及加密后的数据格式）
  let crypted = cipher.update(data, 'binary', 'hex');

  // 加密结束：结尾加上 cipher.final('hex') 表示结束
  crypted += cipher.final('hex');

  // 返回密文
  return crypted;
};

// 2 定义解密方法
export const aesDecrypt = (crypted: string, key = aesKey, iv = aesIv) => {
  // 转换解密数据：把需要解密的数据，转化成 buffer 格式，再转换成二进制
  crypted = Buffer.from(crypted, 'hex').toString('binary');

  // 创建解密对象
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

  // 开始解密：三个参数（要解密的数据、解密前的数据类型以及解密后的数据格式）
  let decrypted = decipher.update(crypted, 'binary', 'utf8');
  // 解密结束
  decrypted += decipher.final('utf8');

  // 返回明文
  return decrypted;
};

export const storageFile = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(Upload_Folder_Path)) {
      fs.mkdirSync(Upload_Folder_Path);
    }
    cb(null, Upload_Folder_Path);
  },
  filename: (req, file, cb) => {
    let filename = aesDecrypt(req.headers.token as string);
    filename = filename + path.extname(file.originalname);
    cb(null, filename);
  },
});
