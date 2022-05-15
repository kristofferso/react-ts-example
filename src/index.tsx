import ReactDOM from "react-dom";
import React, { useState } from "react";

import "./styles.css";

interface FormValuesInterface {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  receiveNewsletter: boolean;
}

interface ErrorInterface {
  message: string;
}

interface ErrorsObjectInterface {
  firstName?: ErrorInterface;
  lastName?: ErrorInterface;
  phoneNumber?: ErrorInterface;
}

interface TextInputProps extends React.HTMLProps<HTMLInputElement> {
  name: keyof ErrorsObjectInterface;
  value: any;
  errors: ErrorsObjectInterface | null | undefined;
}

interface CheckboxInputProps extends React.HTMLProps<HTMLInputElement> {}

// "Server-side" code
const mockPost = (
  profile: FormValuesInterface
): Promise<{ profile?: FormValuesInterface; errors?: ErrorsObjectInterface }> =>
  new Promise((resolve) => {
    const errors: ErrorsObjectInterface = {};

    console.log({ profile });
    if (!profile.firstName)
      errors.firstName = { message: "Missing first name!" };
    if (!profile.lastName) errors.lastName = { message: "Missing last name!" };
    if (!profile.phoneNumber) {
      errors.phoneNumber = { message: "Missing phone number!" };
    } else if (profile.phoneNumber.replace(/[^0-9]/, "").length !== 8) {
      errors.phoneNumber = {
        message: "Phone number must be 8 digits",
      };
    }

    if (Object.keys(errors).length > 0) {
      resolve({ errors });
      return;
    }

    resolve({ profile });
  });

// Client side code below

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  errors,
  ...props
}) => (
  <>
    <input name={name} value={value} {...props} />
    {errors?.hasOwnProperty(name) && (
      <p className="error">{errors?.[name]?.message}</p>
    )}
  </>
);

const CheckboxInput: React.FC<CheckboxInputProps> = ({ ...props }) => (
  <input type="checkbox" {...props} />
);

const ProfileForm: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValuesInterface>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    receiveNewsletter: false,
  });
  const [errors, setErrors] = useState<ErrorsObjectInterface | null>(null);

  const { firstName, lastName, phoneNumber, receiveNewsletter } = formValues;

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value, name, checked, type } = event.target;
    if (type === "text" || type === "tel") {
      setFormValues({ ...formValues, [name]: value });
    }
    if (type === "checkbox") {
      setFormValues({ ...formValues, [name]: checked });
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrors(null);

    console.log({ formValues });

    const response = await mockPost({
      firstName,
      lastName,
      phoneNumber,
      receiveNewsletter,
    });

    if (response.errors) {
      setErrors(response.errors);
    } else if (response.profile) {
      setFormValues(response.profile);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="firstName">
        First name:
        <TextInput
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={onInputChange}
          errors={errors}
          required
        />
      </label>

      <label htmlFor="lastName">
        Last name:
        <TextInput
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={onInputChange}
          errors={errors}
          required
        />
      </label>

      <label htmlFor="phoneNumber" id="phoneLabel">
        Phone number:
        <TextInput
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={onInputChange}
          errors={errors}
          pattern="[0-9]{8}"
          title="A valid phone number (8 characters), for example 99882233"
          aria-labelledby="phoneLabel phoneDescription"
          required
        />
      </label>
      <span id="phoneDescription">8 characters, for example 99882233</span>

      <label htmlFor="receiveNewsletter">
        Receive newsletter?
        <CheckboxInput
          id="receiveNewsletter"
          name="receiveNewsletter"
          checked={receiveNewsletter}
          onChange={onInputChange}
        />
      </label>

      <button type="submit">Save changes</button>
    </form>
  );
};

ReactDOM.render(<ProfileForm />, document.getElementById("root"));
