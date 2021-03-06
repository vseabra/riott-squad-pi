// Libraries
import { BaseEntity, Connection, FindConditions, FindManyOptions, getConnection, ObjectID } from 'typeorm';

// Models
import { IGetListParams, EnumConstants } from '../../../models';

/**
 * BaseRepository
 *
 * Classe que todo repositório estende
 */
export class BaseRepository {
    private connection: Connection;

    protected entity: typeof BaseEntity;

    /**
     * getConnection
     *
     * Retorna singleton de conexão com o banco
     *
     * @return Instância de conexão
     */
    protected getConnection(): Connection {
        if (!this.connection) {
            this.connection = getConnection(EnumConstants.CONNECTION_NAME);
        }

        return this.connection;
    }

    /**
     * list
     *
     * Retorna lista de itens
     *
     * @param params - Parâmetros de busca
     *
     * @returns Lista contendo os itens e a quantidade total de itens
     */
    public list<Entity>(params: IGetListParams): Promise<[Entity[], number]> {
        const skip: number = (params.page - 1) * params.size;
        const options: FindManyOptions<Entity> = {
            take: params.size,
            skip
        };

        if (params.order) {
            (options.order as Record<string, IGetListParams['orderBy']>) = { [params.order]: params.orderBy };
        }

        return this.getConnection().getRepository<Entity>(this.entity).findAndCount(options);
    }

    /**
     * findOne
     *
     * Busca um item pelo iD
     *
     * @param id - ID do item
     *
     * @returns Item buscado
     */
    public findOne<Entity>(id: string | number | ObjectID | Date): Promise<Entity | undefined> {
        return this.getConnection().getRepository<Entity>(this.entity).findOne(id);
    }

    /**
     * find
     *
     * Busca todos os itens que atenderem a condição
     *
     * @param options - Condições de busca
     *
     * @returns Lista de itens
     */
    public find<Entity>(options?: FindConditions<Entity> | undefined): Promise<Entity[]> {
        return this.getConnection().getRepository<Entity>(this.entity).find(options);
    }
}
