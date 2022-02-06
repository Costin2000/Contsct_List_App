import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Telephone } from './telephone.models';
import { classToPlain, Exclude } from 'class-transformer';

@Entity({
  orderBy: {
    firstName: 'ASC',
  },
})
export class Contact {
  @PrimaryGeneratedColumn()
  @Exclude({ toPlainOnly: true })
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @OneToMany(() => Telephone, (telephone) => telephone.contact, { eager: true })
  telephones: Telephone[];

  toJSON() {
    return classToPlain(this);
  }
}
