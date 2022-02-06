import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { contactChangestDTO } from './dto/contactChanges.dto';
import { AddContactDTO } from './dto/AddContact.dto';
import { newNumberDTO } from './dto/newNumber.dto';
import { numberChangesDTO } from './dto/numberChanges.dto';
import { Contact } from './models/contact.models';
import { Telephone } from './models/telephone.models';

@Controller('contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  public getContacts(): Promise<Contact[]> {
    return this.contactService.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string): Promise<Contact> {
    return await this.contactService.findOne(name);
  }

  @Get(':letter/filter')
  public getFilterdContacts(@Param('letter') letter: string) {
    return this.contactService.getFilterdContacts(letter);
  }

  @Post()
  create(@Body() addContactDTO: AddContactDTO): Promise<Contact> {
    return this.contactService.newContact(addContactDTO);
  }

  @Patch('')
  public addNumberToContact(@Body() newNr: newNumberDTO): Promise<Telephone> {
    return this.contactService.addNewNumber(newNr);
  }

  @Patch(':id/contact')
  public patchContactById(
    @Param('id') id: number,
    @Body() changes: contactChangestDTO,
  ) {
    return this.contactService.modifyContact(id, changes);
  }

  @Patch(':id/number')
  public patchNumberById(
    @Param('id') id: number,
    @Body() changes: numberChangesDTO,
  ) {
    return this.contactService.modifyNumber(id, changes);
  }

  @Delete(':id')
  async deleteContact(@Param('id') id: number) {
    if (await this.contactService.deleteContact(id)) {
      return {
        success: true,
        message: `The contact with id ${id} has been deleted`,
      };
    }

    return {
      success: false,
      message: `The contact with id ${id} has not been deleted`,
    };
  }
}
