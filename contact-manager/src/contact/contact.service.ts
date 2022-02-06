import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact } from './models/contact.models';
import { ContactRepository } from '../contact/repositories/contact.repository';
import { TelephoneRepository } from '../contact/repositories/telephone.repository';
import { Telephone } from './models/telephone.models';
import { AddContactDTO } from './dto/AddContact.dto';
import { newNumberDTO } from './dto/newNumber.dto';
import { contactChangestDTO } from './dto/contactChanges.dto';
import { numberChangesDTO } from './dto/numberChanges.dto';

@Injectable()
export class ContactService {
  constructor(
    private contactRepository: ContactRepository,
    private telephoneRepository: TelephoneRepository,
  ) {}

  findAll(): Promise<Contact[]> {
    return this.contactRepository.find();
  }

  async findOne(name: string): Promise<Contact> {
    const searchedContact = await this.contactRepository.findOne({
      firstName: name,
    });

    if (searchedContact === undefined) {
      throw new NotFoundException(
        `Contact with first name ${name} was not found.`,
      );
    }

    return searchedContact;
  }

  public getFilterdContacts(letter: string): Promise<Contact[]> {
    return this.contactRepository.find();
  }

  async deleteContact(id: number): Promise<boolean> {
    const original = await this.contactRepository.findOne({ id });

    if (original === undefined) {
      throw new NotFoundException(`Contact with id ${id} was not found.`);
    }

    for (const number of original.telephones) {
      await this.telephoneRepository.remove(number);
    }

    await this.contactRepository.remove(original);

    return true;
  }

  async newContact(newContact: AddContactDTO): Promise<Contact> {
    const { firstName, lastName, email } = newContact;
    const { number, type } = newContact;

    const newNumber = new Telephone();
    newNumber.number = number;
    newNumber.type = type;
    await this.telephoneRepository.save(newNumber);

    const contact = new Contact();
    contact.telephones = [newNumber];
    contact.firstName = firstName;
    contact.lastName = lastName;
    contact.email = email;
    return this.contactRepository.save(contact);
  }

  async addNewNumber(newNumber: newNumberDTO): Promise<Telephone> {
    const { contactId, number, type } = newNumber;

    const contact = await this.contactRepository.findOne({ id: contactId });

    if (contact === undefined) {
      throw new NotFoundException(
        `Contact with id ${contactId} was not found.`,
      );
    }

    const toAdd = new Telephone();
    toAdd.number = number;
    toAdd.type = type;
    toAdd.contact = contact;

    await this.contactRepository.save(contact);

    return this.telephoneRepository.save(toAdd);
  }

  async modifyContact(idx: number, changes: contactChangestDTO) {
    const contact = await this.contactRepository.findOne({ id: idx });

    if (contact === undefined) {
      throw new NotFoundException(`Contact with id ${idx} was not found.`);
    }

    const aux = { ...contact, ...changes };

    return this.contactRepository.save(aux);
  }

  async modifyNumber(idx: number, changes: numberChangesDTO) {
    const number = await this.telephoneRepository.findOne({ id: idx });

    if (number === undefined) {
      throw new NotFoundException(`Contact with id ${idx} was not found.`);
    }

    const aux = { ...number, ...changes };

    return this.telephoneRepository.save(aux);
  }
}
