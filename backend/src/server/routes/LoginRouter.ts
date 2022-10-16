
import { Router, Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Core } from '../../core/Core';
import * as winston from "winston";


interface LoginData {
    username: string;
    password: string;
}


export class LoginRouter {
    protected readonly log: winston.Logger;
    router: Router;
    core: Core;

    constructor(hccore: Core) {
        this.log = winston.child({
            name: 'Login Router',
            type: this.constructor.name,
          });
        this.router = Router();
        this.core = hccore;
        this.init();
    }

    login(req: Request, res: Response, next: NextFunction) {
        const data: LoginData = req.body as LoginData;
        this.log.debug('LoginData', data);
        if (!data.password || !data.username) {
            res.status(403); // FORBIDDEN
            res.json(null);
            return;
        }

        if (this.core.settings.username === data.username && this.core.settings.password === data.password) {
            res.status(200); // OK
            const token: string = jwt.sign(
                {
                    username: data.username,
                },
                this.core.settings.jwtKey,
                {
                    expiresIn:  this.core.settings.jwtValidity * 60 * 60 * 24
                }
            );
            res.contentType('application/JSON');
            res.json({ token: token });
        } else {
            res.status(403); // FORBIDDEN
            res.json(null);
            return;
        }

        // User.findOne({ name: data.username }).then(
        //     (user) => {
        //         if (!user) {
        //             res.status(403); // FORBIDDEN
        //             res.json(null);
        //             return;
        //         }
        //         if (bcrypt.compareSync(data.password, user.pwd)) {
        //             res.status(200); // OK
        //             const token: string = jwt.sign(
        //                 {
        //                     userId: user._id,
        //                     userName: user.name,
        //                     roles: user.roles
        //                 },
        //                 Globals.JWT_KEY,
        //                 {
        //                     expiresIn: Globals.JWT_VALIDITY * 60 * 60 * 24
        //                 }
        //             );
        //             res.contentType('application/JSON');
        //             res.json({ token: token });
        //         } else {
        //             res.status(403); // FORBIDDEN
        //             res.json(null);
        //         }
        //     },
        //     (error) => {
        //         res.status(403); // FORBIDDEN
        //         res.json(null);
        //     }
        // );

    }

    init() {

        this.router.post('/', this.login.bind(this));
    }


}
