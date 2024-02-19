import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'messages' })
export class MessageStructure {
  @PrimaryGeneratedColumn({ name: 'messageId' })
  id: number;

  @Column('varchar', { name: 'email', length: 40 })
  email: string;

  @Column('text')
  msg: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
