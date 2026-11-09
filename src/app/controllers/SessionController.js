import * as Yup from 'yup';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

class SessionController {
  async store(req, res) {
    const schema = Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

    const isValid = await schema.isValid(req.body, {abortEarly: false, strict: true });

    const emailOrPasswordIncorrect = () => {
      return res.status(400).json({ error: 'Incorrect email or password' });
    };

    if (!isValid) {
      return emailOrPasswordIncorrect();
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return emailOrPasswordIncorrect();
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password_hash);
    if (!isPasswordCorrect) {
      return emailOrPasswordIncorrect();
    }

    return res.status(200).json({ message: 'Login successful' ,
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
    });
  }
}

export default new SessionController();
