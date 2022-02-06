import { EntityRepository, Like, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Contact } from '../models/contact.models';

@Injectable()
@EntityRepository(Contact)
export class ContactRepository extends Repository<Contact> {
  async findByFstLetter(letter: string) {
    return await this.createQueryBuilder('contact')
      .where('contact.firstName.startsWith(l)', { l: letter })
      .getMany();
  }
}
