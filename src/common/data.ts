import dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';

export const sharedData = {
  fields: {
    register: {
      email: {
        input: 'text',
        type: 'email',
        label: 'Email',
        placeholder: 'john@gmail.com',
        value: 'o.alkhatib962@gmail.com',
        autocomplete: 'email',
        hint: 'Write your own email please',
        rules: {
          required: { value: true, error: 'The email field is required' },
          min_length: {
            value: 6,
            error: 'Email should be at least 6 characters',
          },
          max_length: {
            value: 32,
            error: 'Email should be at most 32 characters',
          },
        },
      },
      password: {
        input: 'text',
        type: 'password',
        label: 'Password',
        placeholder: '********',
        value: 'gh90ghgh',
        autocomplete: 'password',
        secured: true,
        rules: {
          required: { value: true, error: 'The password field is required' },
          min_length: {
            value: 6,
            error: 'Password should be at least 6 characters',
          },
          max_length: {
            value: 32,
            error: 'Password should be at most 32 characters',
          },
        },
      },
      user_name: {
        input: 'text',
        type: 'text',
        label: 'Username',
        placeholder: 'Your username',
        autocomplete: 'username',
        value: 'omar.alkhatib.962',
        rules: {
          required: { value: true, error: 'The username field is required' },
          min_length: {
            value: 6,
            error: 'Username should be at least 6 characters',
          },
          max_length: {
            value: 32,
            error: 'Username should be at most 32 characters',
          },
        },
      },
      first_name: {
        input: 'text',
        type: 'text',
        label: 'First Name',
        placeholder: 'John',
        autocomplete: 'given-name',
        value: '',
        rules: {
          required: { value: true, error: 'The first name field is required' },
          min_length: {
            value: 2,
            error: 'First name should be at least 2 characters',
          },
          max_length: {
            value: 32,
            error: 'First name should be at most 32 characters',
          },
        },
      },
      last_name: {
        input: 'text',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Doe',
        autocomplete: 'family-name',
        value: '',
        rules: {
          required: { value: true, error: 'The last name field is required' },
          min_length: {
            value: 2,
            error: 'Last name should be at least 2 characters',
          },
          max_length: {
            value: 32,
            error: 'Last name should be at most 32 characters',
          },
        },
      },
      phone_number: {
        input: 'text',
        type: 'tel',
        label: 'Phone Number',
        placeholder: '+962 7XXXXXXXX',
        autocomplete: 'tel',
        value: '',
        rules: {
          required: {
            value: true,
            error: 'The phone number field is required',
          },
          pattern: {
            value: '^\\+?[0-9]{7,15}$',
            error: 'Phone number must be valid',
          },
        },
      },
    },
    forget_password: {
      phone_number: {
        input: 'text',
        type: 'tel',
        label: 'Phone Number',
        placeholder: '+962 7XXXXXXXX',
        autocomplete: 'tel',
        value: '',
        rules: {
          required: {
            value: true,
            error: 'The phone number field is required',
          },
          pattern: {
            value: '^\\+?[0-9]{7,15}$',
            error: 'Phone number must be valid',
          },
          min_length: {
            value: 10,
            error: 'Phone number should be at least 10 characters',
          },
          max_length: {
            value: 15,
            error: 'Phone number should be at most 15 characters',
          },
        },
      },
    },
    login: {
      email: {
        input: 'text',
        type: 'email',
        label: 'Email',
        placeholder: 'john@gmail.com',
        value: 'o.alkhatib962@gmail.com',
        autocomplete: 'email',
        hint: 'Write your own email please',
        rules: {
          required: { value: true, error: 'The email field is required' },
          min_length: {
            value: 6,
            error: 'Email should be at least 6 characters',
          },
          max_length: {
            value: 32,
            error: 'Email should be at most 32 characters',
          },
        },
      },
      password: {
        input: 'text',
        type: 'password',
        label: 'Password',
        placeholder: '********',
        autocomplete: 'password',
        value: 'gh90ghgh',
        secured: true,
        rules: {
          required: { value: true, error: 'The password field is required' },
          min_length: {
            value: 6,
            error: 'Password should be at least 6 characters',
          },
          max_length: {
            value: 32,
            error: 'Password should be at most 32 characters',
          },
        },
      },
    },
  },
  otp: {
    otp_every: 5,
    otp_times: 4,
    otp_length: 2,
  },
  rides: {
    otp_every: 5,
    otp_times: 4,
    otp_length: 2,
  },
  costs: {
    amman: {
      mafraq: {
        driver_male: 1,
        driver_female: 2,
        male: 3,
        female: 4,
        gift_fast: 12,
        gift_normal: 3,
      },
    },
    mafraq: {
      amman: {
        driver_male: 1,
        driver_female: 2,
        male: 3,
        female: 4,
        gift_fast: 12,
        gift_normal: 3,
      },
    },
  },
};

let assetsPath = join(process.cwd(), 'uploads');

dotenv.config();

export const appConfig = {
  path: process.cwd(),
  assets_path: assetsPath,
  course_images: `/course_images`,
  assets_url: `${process.env.APP_URL}/uploads`,
  routes: {
    rider: {
      welcome: '/welcome',
      error: '/error',
      pickup: '/pickup',
      login: '/login',
      register: '/register',
      dropoff: '/dropoff',
      forgetPassword: '/forget-password',
      pending: '/pending',
      order_map: '/ride-map',
      rate: '/rate',
    },
    driver: {
      welcome: '/welcome',
      error: '/error',
      login: '/login',
      register: '/register',
      forgetPassword: '/forget-password',
      map : "/map"
    },
  },
};