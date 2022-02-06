import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Contact } from './contact.models';
import { classToPlain, Exclude } from 'class-transformer';

@Entity()
export class Telephone {
  @PrimaryGeneratedColumn()
  @Exclude({ toPlainOnly: true })
  public id: number;

  @Column({ length: 255 })
  public number: string;

  @Column({ length: 255 })
  public type: string;

  @ManyToOne(() => Contact, (contact) => contact.telephones, { nullable: true })
  contact?: Contact;

  toJSON() {
    return classToPlain(this);
  }
}
