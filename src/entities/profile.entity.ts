import {
    Entity,
    PrimaryGeneratedColumn,
    Column,

    UpdateDateColumn, CreateDateColumn,
} from "typeorm";




@Entity()
export class Profile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique:true
    })
    userId: string;

    @Column({
        type:"simple-json",
        nullable: true,
    })
    role: string[];

    @Column({default:2000000000})
    totalSpace: number;

    @CreateDateColumn({nullable: true})
    dateCreation: Date;

    @UpdateDateColumn({nullable: true})
    dateModification: Date;

    constructor(options: {} = null) {
        if (options) {
            Object.assign(this, options);
            if(!options['role']){
                this.role=['user']
            }
        }
    }

}