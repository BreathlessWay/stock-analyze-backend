import { Entity, Column, PrimaryGeneratedColumn, EntitySchema } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  operName: string;

  @Column()
  passwd: string;
}

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    operName: {
      type: String,
    },
    passwd: {
      type: String,
    },
  },
});
