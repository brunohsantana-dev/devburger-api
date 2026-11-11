/*
store -> cria dado
index -> lista todos os dados
show -> listar um dado
update -> atualizar um dado
delete -> deletar um dado

esses metodos nao podem ser duplicados, cada um tem sua funcao especifica
*/
import User from '../models/User.js';
import { v4 } from 'uuid';
import * as Yup from 'yup';
import bcrypt from 'bcrypt';

class UserController {
  async store(req, res) {

    const schema = Yup.object({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

    try {
     schema.validateSync(req.body, { abortEarly: false, strict: true });
    }catch (err) {
        return res.status(400).json({error: err.errors});
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);


    const user = await User.create({
      id: v4(),
      name,
      email,
      password_hash,
      admin: false,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
    });
  }
}

export default new UserController();
