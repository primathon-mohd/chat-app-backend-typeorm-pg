import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class RegisteredUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 40,
    name: 'email-id',
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('varchar', { length: 40, nullable: true })
  username: string;

  @Column('text', { name: 'bcrypt' })
  password: string;

  @Column('numeric', { default: 21, name: 'age' })
  age: number;

  @Column('timestamp', { default: 'now()' })
  createdAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
