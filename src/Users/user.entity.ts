// import { Entity, Column, PrimaryGeneratedColumn, EntitySchema } from 'typeorm';
//
// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;
//
//   @Column()
//   username: string;
//
//   @Column()
//   password: string;
// }
//
// export const UserSchema = new EntitySchema<User>({
//   name: 'User',
//   target: User,
//   columns: {
//     id: {
//       type: Number,
//       primary: true,
//       generated: true,
//     },
//     username: {
//       type: String,
//     },
//     password: {
//       type: String,
//     },
//   },
// });
