// Libraries
import { RequestHandler } from 'express';
import { Schema, Meta } from 'express-validator';

// Repositories
import { ChildRepository } from '../../../../library/database/repository/ChildRepository';
import { UserRepository } from '../../../../library/database/repository/UserRepository';

// Validators
import { BaseValidator } from '../../../../library/BaseValidator';

// Utils
import { StringUtils } from '../../../../utils';

// Entities
import { Child, User } from '../../../../library/database/entity';

/**
 * ChildValidator
 *
 * Classe de validadores para o endpoint de membros
 */
export class ChildValidator extends BaseValidator {
    /**
     * model
     *
     * Schema para validação no controller de usuários
     */
    private static model: Schema = {
        name: BaseValidator.validators.name,
        id: {
            ...BaseValidator.validators.id(new ChildRepository()),
            errorMessage: 'Membro não encontrado'
        },
        allowance: { in: 'body', isFloat: { options: { min: 0 } }, errorMessage: 'Valor da mesada invalido' },
        // TODO fazer um custom validtor para verficar que a criança tem menos de 18 anos.
        // TODO talvez fazer um validator para padronizar o formato de data.
        birthday: { in: 'body', isDate: true, errorMessage: 'Aniversário Invalido' },
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
        duplicate: {
            errorMessage: 'Membro já existe',
            custom: {
                options: async (_: string, { req }) => {
                    let check = false;

                    if (req.body.name) {
                        const childRepository: ChildRepository = new ChildRepository();
                        const child: Child | undefined = await childRepository.findByName(req.body.name);

                        check = child ? req.body.id === child.id.toString() : true;
                    }

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
            allowance: ChildValidator.model.allowance,
            parent: ChildValidator.model.parent,
            duplicate: ChildValidator.model.duplicate
        });
    }

    /**
     * put
     *
     * @summary retorna basicamente todos os validadores de model, menos o duplicate.
     *
     * @returns Lista de validadores
     */
    public static put(): RequestHandler[] {
        return ChildValidator.validationList({
            id: ChildValidator.model.id,
            ...ChildValidator.model
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
