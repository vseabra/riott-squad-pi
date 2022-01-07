// Libraries
import { RequestHandler } from 'express';
import { Schema, Meta } from 'express-validator';

// Repositories
import { ChildRepository } from '../../../../library/database/repository/ChildRepository';
import { UserRepository } from '../../../../library/database/repository/UserRepository';

// Validators
import { BaseValidator } from '../../../../library/BaseValidator';

// Utils
import { StringUtils, FileUtils } from '../../../../utils';

// Entities
import { User } from '../../../../library/database/entity';

// Constants
import { DateConstants } from '../../../../models/EnumConstants';

/**
 * ChildValidator
 *
 * Classe de validadores para o endpoint de membros
 */
export class ChildValidator extends BaseValidator {
    /**
     * model
     *
     * Schema para validação no controller de membros
     */
    private static model: Schema = {
        name: BaseValidator.validators.name,
        id: {
            ...BaseValidator.validators.id(new ChildRepository()),
            errorMessage: 'Membro não encontrado'
        },
        allowance: { in: 'body', isFloat: { options: { min: 0 } }, errorMessage: 'Valor da mesada invalido' },
        // TODO fazer um validator para padronizar o formato de data.
        birthday: { in: 'body', isDate: { options: { format: 'DD/MM/YYYY' } }, errorMessage: 'Aniversário Invalido' },
        photo: {
            in: 'body',
            custom: {
                options: async (_value: string, { req }: Meta) => {
                    let check = false;

                    if (req.files && req.files[0]) {
                        const { buffer } = req.files[0];

                        check = FileUtils.isPNG(buffer) || FileUtils.isJPG(buffer);

                        req.body.photoRef = buffer.toString('base64');
                    }

                    return check ? Promise.resolve() : Promise.reject();
                }
            },
            errorMessage: 'Foto inválida'
        },
        parent: {
            in: 'body',
            isInt: true,
            custom: {
                options: async (value: string, { req }: Meta) => {
                    const repository: UserRepository = new UserRepository();
                    const parent: User | undefined = await repository.findOne(value);

                    // Usa o nome do repositório para criar o nome de referência. Ex: UserRepository => userRef
                    const refName: string = StringUtils.firstLowerCase(repository.constructor.name.replace('Repository', ''));

                    req.body[`${refName}Ref`] = parent;

                    return parent ? Promise.resolve() : Promise.reject();
                }
            },
            errorMessage: 'Id do responsavel invalido'
        },
        minor: {
            errorMessage: 'O membro deve ter menos de 18 anos',
            custom: {
                options: async (_: string, { req }) => {
                    let check = false;

                    const currentDate: number = Date.now();
                    const [birthDay, birthMonth, birthYear] = req.body.birthday.split('/');
                    const birthDate: number = new Date([birthMonth, birthDay, birthYear].join('/')).getTime();
                    const age: number = currentDate - birthDate;

                    check = age < DateConstants.EIGHTEEN_YEARS_IN_MILISECONDS;
                    return check ? Promise.resolve() : Promise.reject();
                }
            }
        }
    };

    /**
     * post
     *
     * @returns Lista de validadores
     */
    public static post(): RequestHandler[] {
        return ChildValidator.validationList({
            name: ChildValidator.model.name,
            birthday: ChildValidator.model.birthday,
            minor: ChildValidator.model.minor,
            allowance: ChildValidator.model.allowance,
            parent: ChildValidator.model.parent,
            photo: ChildValidator.model.photo
        });
    }

    /**
     * put
     *
     * @summary retorna basicamente todos os validadores de model
     *
     * @returns Lista de validadores
     */
    public static put(): RequestHandler[] {
        return ChildValidator.validationList({
            id: ChildValidator.model.id,
            birthday: { ...ChildValidator.model.birthday, optional: true },
            minor: { ...ChildValidator.model.minor, optional: true },
            allowance: { ...ChildValidator.model.allowance, optional: true },
            photo: { ...ChildValidator.model.photo, optional: true }
        });
    }

    /**
     * patch
     *
     * @summary retorna basicamente todos os validadores de model
     *
     * @returns Lista de validadores
     */
    public static patch(): RequestHandler[] {
        return ChildValidator.validationList({
            id: ChildValidator.model.id
        });
    }

    /**
     * onlyId
     *
     * @returns Lista de validadores
     */
    public static onlyId(): RequestHandler[] {
        return BaseValidator.validationList({
            id: ChildValidator.model.id
        });
    }
}
