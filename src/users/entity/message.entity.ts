import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'messages' })
export class MessageStructure {
  @PrimaryGeneratedColumn({ name: 'messageId' })
  id: number;

  @Column('varchar', { name: 'email', length: 40, default: 'NA' })
  email: string;

  @Column('text')
  msg: string;

  @Column()
  // @ManyToOne(() => RegisteredUser, { eager: true })
  sender_user_id: number;
  @Column()
  // @ManyToOne(() => RegisteredUser, { eager: true })
  receiver_user_id: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
