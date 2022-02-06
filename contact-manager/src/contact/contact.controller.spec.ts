import { NotFoundException, Query } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from 'rxjs';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { contactChangestDTO } from './dto/contactChanges.dto';
import { AddContactDTO } from './dto/AddContact.dto';

describe('ContactController', () => {
  let controller: ContactController;

  const mockContactsService = {
    newContact: jest.fn((contact: AddContactDTO) => {
      const id = 1;
      return {
        id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        telephones: [
          {
            id,
            number: contact.number,
            type: contact.type,
          },
        ],
      };
    }),

    findAll: jest.fn(() => {
      return [];
    }),

    findOne: jest.fn((name: any): Promise<any> => {
      if (name === 'known_name') {
        return Promise.resolve({ name });
      }
      throw new NotFoundException('error');
    }),

    modifyContact: jest.fn((id: number, changes: any) => {
      if (id === 1) {
        return {
          id,
          ...changes,
        };
      }
      throw new NotFoundException('error');
    }),

    modifyNumber: jest.fn((id: number, changes: any) => {
      if (id == 1) return { id, ...changes };
      throw new NotFoundException('error');
    }),

    addNewNumber: jest.fn((number: any) => {
      if (number.contactId === 1) {
        return [number];
      }
      throw new NotFoundException('error');
    }),

    deleteContact: jest.fn((id: any): Promise<any> => {
      if (id === 1) {
        return Promise.resolve('the user has been deleted');
      }
      throw new NotFoundException('error');
    }),

    getFilterdContacts: jest.fn((propertyName: string, letter: string) => {
      return [];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: mockContactsService }],
    }).compile();

    controller = module.get<ContactController>(ContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new contact', () => {
    const postContactSpy = jest.spyOn(mockContactsService, 'newContact');
    const contact = {
      firstName: 'alexandru',
      lastName: 'dumitru',
      email: 'alexdumitru@yahoo.com',
      number: '0763674453',
      type: 'work',
    };

    expect(controller.create(contact)).toEqual({
      id: 1,
      firstName: contact.firstName,
      lastName: contact.lastName,
      telephones: [
        {
          id: 1,
          number: contact.number,
          type: contact.type,
        },
      ],
    });
    expect(postContactSpy).toHaveBeenCalledTimes(1);
    expect(postContactSpy).toHaveBeenCalledWith(contact);
  });

  it('should return a list of contacts', () => {
    const getContactsSpy = jest.spyOn(mockContactsService, 'findAll');
    expect(controller.getContacts()).toEqual([]);
    expect(getContactsSpy).toHaveBeenCalledTimes(1);
  });

  it('find by name', async () => {
    const name = 'known_name';
    const returnVal = { name };
    const getContactByNameSpy = jest.spyOn(mockContactsService, 'findOne');
    expect(await controller.findOne(name)).toEqual({ name });
    expect(getContactByNameSpy).toHaveBeenCalledWith(name);
    expect(getContactByNameSpy).toHaveBeenCalledTimes(1);
  });

  it('find by name, should throw NotFoundException if contact is not in database', async () => {
    const name = 'unknown_name';
    const getContactByNameSpy = jest.spyOn(mockContactsService, 'findOne');
    expect(controller.findOne(name)).rejects.toThrowError(NotFoundException);
    expect(getContactByNameSpy).toHaveBeenCalledWith(name);
  });

  it('should update a contact', () => {
    const contact = {
      firstName: 'alexandru',
      lastName: 'dumitru',
      email: 'alexdumitru@yahoo.com',
      number: '0763674453',
      type: 'work',
    };
    const id = 1;
    const modifyContactSpy = jest.spyOn(mockContactsService, 'modifyContact');
    expect(controller.patchContactById(id, contact)).toEqual({
      id: 1,
      ...contact,
    });
    expect(modifyContactSpy).toHaveBeenCalledWith(id, contact);
    expect(modifyContactSpy).toHaveBeenCalledTimes(1);
  });

  it('should modify a contact, wrong id case', () => {
    const contact = {
      firstName: 'alexandru',
      lastName: 'dumitru',
      email: 'alexdumitru@yahoo.com',
      number: '0763674453',
      type: 'work',
    };
    const id = 2;
    const modifyContactSpy = jest.spyOn(mockContactsService, 'modifyContact');
    expect(() => {
      controller.patchContactById(id, contact);
    }).toThrowError(NotFoundException);
    expect(modifyContactSpy).toHaveBeenCalledWith(id, contact);
  });

  it('should modify a number', () => {
    const phone = { number: '074321737' };
    const id = 1;
    const modifyNumberSpy = jest.spyOn(mockContactsService, 'modifyNumber');

    expect(controller.patchNumberById(id, phone)).toEqual({
      id: 1,
      ...phone,
    });
    expect(modifyNumberSpy).toHaveBeenCalledWith(id, phone);
    expect(modifyNumberSpy).toHaveBeenCalledTimes(1);
  });

  it('should modify a number, wrong id case', () => {
    const phone = { number: '074321737' };
    const id = 2;
    const modifyNumberSpy = jest.spyOn(mockContactsService, 'modifyNumber');

    expect(() => {
      controller.patchNumberById(id, phone);
    }).toThrowError(NotFoundException);
    expect(modifyNumberSpy).toHaveBeenCalledWith(id, phone);
  });

  it('should add a new number to the list', () => {
    const newNR = { contactId: 1, number: '0763674499', type: 'work' };
    const addNewNrSpy = jest.spyOn(mockContactsService, 'addNewNumber');

    expect(controller.addNumberToContact(newNR)).toEqual([newNR]);
    expect(addNewNrSpy).toHaveBeenCalledWith(newNR);
    expect(addNewNrSpy).toHaveBeenCalledTimes(1);
  });

  it('should add a new nr, wrong id case', () => {
    const newNR = { contactId: 2, number: '0763674499', type: 'work' };
    const addNewNrSpy = jest.spyOn(mockContactsService, 'addNewNumber');

    expect(() => {
      controller.addNumberToContact(newNR);
    }).toThrowError(NotFoundException);
    expect(addNewNrSpy).toHaveBeenCalledWith(newNR);
  });

  it('should delete a contact', async () => {
    const id = 1;
    const deleteContactSpy = jest.spyOn(mockContactsService, 'deleteContact');

    await controller.deleteContact(id);
    expect(deleteContactSpy).toHaveBeenCalledWith(id);
    expect(deleteContactSpy).toHaveBeenCalledTimes(1);
  });

  it('delete a contact, wrong id case', async () => {
    const id = 2;
    const deleteContactSpy = jest.spyOn(mockContactsService, 'deleteContact');
    await expect(controller.deleteContact(id)).rejects.toThrowError(
      NotFoundException,
    );
    expect(deleteContactSpy).toHaveBeenCalledWith(id);
  });

  it('should filter contacts by letter', () => {
    const query = '?property_name=firstName&letter=g';
    const filterContactsSpy = jest.spyOn(
      mockContactsService,
      'getFilterdContacts',
    );
    expect(controller.getFilterdContacts(query)).toEqual([]);
    expect(filterContactsSpy).toHaveBeenCalledTimes(1);
  });
});
