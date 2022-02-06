import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { Contact } from './models/contact.models';
import { Telephone } from './models/telephone.models';
import { ContactRepository } from './repositories/contact.repository';
import { TelephoneRepository } from './repositories/telephone.repository';

const dummyContact = {
  id: 1,
  firstName: 'known',
  lastName: 'dumitru',
  email: 'alexdumitru@yahoo.com',
  telephones: [],
};

const dummyTelephone = {
  id: 1,
  number: '0763674499',
  type: 'work',
  email: 'email@yahoo.com',
};

const mockContactRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest
    .fn()
    .mockImplementation((user) => Promise.resolve({ id: Date.now(), ...user })),
  findOne: jest.fn((firstName: string) => {
    Promise.resolve(dummyContact);
  }),
  remove: jest.fn((contact: Contact) => {
    Promise.resolve(contact);
  }),
  find: jest.fn().mockImplementation((dto) => []),
};

const mockTelephoneRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest
    .fn()
    .mockImplementation((user) => Promise.resolve({ id: Date.now(), ...user })),
  findOne: jest.fn().mockImplementation((id) => {
    Promise.resolve(undefined);
  }),
  remove: jest.fn((telephone: Telephone) => {
    Promise.resolve(Telephone);
  }),
  find: jest.fn().mockImplementation((dto) => []),
};

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: ContactRepository,
          useValue: mockContactRepository,
        },
        {
          provide: TelephoneRepository,
          useValue: mockTelephoneRepository,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new contact and a new telephone', async () => {
    const contact = {
      firstName: 'alexandru',
      lastName: 'dumitru',
      email: 'alexdumitru@yahoo.com',
      number: '0763674453',
      type: 'work',
    };
    const saveContactSpy = jest.spyOn(mockContactRepository, 'save');
    const saveTelephonesSpy = jest.spyOn(mockTelephoneRepository, 'save');
    expect(await service.newContact(contact)).toEqual({
      id: expect.any(Number),
      firstName: 'alexandru',
      lastName: 'dumitru',
      email: 'alexdumitru@yahoo.com',
      telephones: [{ number: '0763674453', type: 'work' }],
    });
    expect(saveContactSpy).toHaveBeenCalledTimes(1);
    expect(saveTelephonesSpy).toHaveBeenCalledTimes(1);
  });

  it('should return a empty list of contacts', () => {
    const findContactSpy = jest.spyOn(mockContactRepository, 'find');
    expect(service.findAll()).toEqual([]);
    expect(findContactSpy).toHaveBeenCalledTimes(1);
  });

  it('should return a contact with the name given', async () => {
    const name = 'known';
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        return Promise.resolve(dummyContact);
      });
    const result = await service.findOne(name);

    expect(result).toEqual(dummyContact);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      firstName: 'known',
    });
  });

  it('return a contact with the given name, excepsion case', async () => {
    const name = 'unknown';
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        throw new NotFoundException();
      });
    try {
      await service.findOne(name);
    } catch (excepsion) {
      expect(findOneSpy).toHaveBeenCalled();
      expect(findOneSpy).toHaveBeenCalledWith({
        firstName: 'unknown',
      });
      expect(excepsion.message).toBe('Not Found');
    }
    expect(findOneSpy).toHaveBeenCalled();
  });

  it('should return the contact list filtered by some filter given', () => {
    let fstLetter = 'a';
    const findContactSpy = jest.spyOn(mockContactRepository, 'find');
    expect(service.getFilterdContacts(fstLetter)).toEqual([]);
    expect(findContactSpy).toHaveBeenCalled();
  });

  it('deleteContactByID', async () => {
    const id = 1;
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        return Promise.resolve(dummyContact);
      });
    const removeSpy = jest
      .spyOn(mockContactRepository, 'remove')
      .mockImplementation(() => {
        return true;
      });
    expect(await service.deleteContact(1)).toEqual(true);
    expect(findOneSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(dummyContact);
  });

  it('deleteContactByID, when index not found', async () => {
    const id = 1;
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        throw new NotFoundException();
      });
    try {
      await service.deleteContact(id);
    } catch (excepsion) {
      expect(findOneSpy).toHaveBeenCalled();
      expect(excepsion.message).toBe('Not Found');
    }
  });

  it('should add a new nr to a contact', async () => {
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        return Promise.resolve(dummyContact);
      });
    const contactSaveSpy = jest.spyOn(mockContactRepository, 'save');
    const telephoneSaaveSpy = jest.spyOn(mockContactRepository, 'save');
    const numberToAdd = { contactId: 1, number: 'newNr', type: 'home' };
    expect(await service.addNewNumber(numberToAdd)).toEqual({
      id: expect.any(Number),
      number: 'newNr',
      type: 'home',
      contact: {
        id: 1,
        firstName: 'known',
        lastName: 'dumitru',
        email: 'alexdumitru@yahoo.com',
        telephones: [],
      },
    });
    expect(findOneSpy).toHaveBeenCalled;
    expect(contactSaveSpy).toHaveBeenCalled;
    expect(telephoneSaaveSpy).toHaveBeenCalled;
  });

  it('newNr to a contact, when contact id not found', async () => {
    const numberToAdd = { contactId: 1, number: 'newNr', type: 'home' };
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        throw new NotFoundException();
      });

    try {
      await service.addNewNumber(numberToAdd);
    } catch (excepsion) {
      expect(findOneSpy).toHaveBeenCalled;
      expect(excepsion.message).toBe('Not Found');
    }
  });

  it('should modify a contact', async () => {
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        return Promise.resolve(dummyContact);
      });
    const contactSaveSpy = jest.spyOn(mockContactRepository, 'save');
    const changes = { firstName: 'alexandru', lastName: 'podgoreanu' };

    const result = await service.modifyContact(1, changes);

    expect(result).toEqual({
      id: 1,
      firstName: 'alexandru',
      lastName: 'podgoreanu',
      email: 'alexdumitru@yahoo.com',
      telephones: [],
    });
    expect(findOneSpy).toHaveBeenCalledWith({ id: 1 });
    expect(contactSaveSpy).toHaveBeenCalledWith(result);
  });

  it('modify a contact, whend there was given a wrong id', async () => {
    const changes = { firstName: 'alexandru', lastName: 'podgoreanu' };
    const findOneSpy = jest
      .spyOn(mockContactRepository, 'findOne')
      .mockImplementation(() => {
        throw new NotFoundException();
      });

    try {
      await service.modifyContact(1, changes);
    } catch (excepsion) {
      expect(findOneSpy).toHaveBeenCalled;
      expect(excepsion.message).toBe('Not Found');
    }
  });

  it('should modify a telephone number', async () => {
    const changes = { number: 'changedNr' };
    const findOneSpy = jest
      .spyOn(mockTelephoneRepository, 'findOne')
      .mockImplementation(() => {
        return Promise.resolve(dummyTelephone);
      });
    const telephoneSaveSpy = jest.spyOn(mockTelephoneRepository, 'save');
    const result = await service.modifyNumber(1, changes);

    expect(result).toEqual({
      id: 1,
      number: 'changedNr',
      type: 'work',
      email: 'email@yahoo.com',
    });
    expect(findOneSpy).toHaveBeenCalledWith({ id: 1 });
    expect(telephoneSaveSpy).toHaveBeenCalledWith(result);
  });

  it('modify a telephone nr, when there was given a wrong id', async () => {
    const changes = { number: 'changedNr' };
    const findOneSpy = jest
      .spyOn(mockTelephoneRepository, 'findOne')
      .mockImplementation(() => {
        throw new NotFoundException();
      });

    try {
      await service.modifyNumber(1, changes);
    } catch (excepsion) {
      expect(findOneSpy).toHaveBeenCalled;
      expect(excepsion.message).toBe('Not Found');
    }
  });
});
