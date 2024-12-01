export const checkValidation = async (data, arayOfTags) => {
    var message = "";
    var validation = true;

    for (let [key, value] of Object.entries(data)) {
        switch (key) {
            case "birthDate":
                var bday = new Date(value);
                var now = new Date();
                var minDate = new Date('1900-01-01');
                if (bday > now) {
                    validation = false;
                    message = "Дата рождения не может превышать текущую дату";
                }
                else if (bday < minDate) {
                    validation = false;
                    message = "Дата рождения не может быть раньше 01.01.1900";
                }
                break;
            case "phoneNumber":
                if (value !== '' && !value.match(/^\+7\d{10}$/)) {
                    validation = false;
                    message = "Введите телефон в формате +7хххххххххх";
                }
                break;
            case "email":
                if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    validation = false;
                    message = "Неверный формат email";
                }
                break;
            case "password":
                if (!value.match(/^.{6,}$/)) {
                    validation = false;
                    message = "Минимальная длина пароля - 6 символов";
                }
                break;
            case "FullName":
                if (!value.trim()) {
                    validation = false;
                    message = "Поле ФИО не должно быть пустым";
                }
                break;
            case "title":
                if (!value.trim()) {
                    validation = false;
                    message = "Название - обязательное поле";
                }
                break;
            case "readingTime":
                if (!value.trim()) {
                    validation = false;
                    message = "Время чтения - обязательное поле";
                }
                break;
            case "tags":
                if (arayOfTags.length === 0) {
                    validation = false;
                    message = "Выберите хотя бы один тэг";
                }
                break;
            case "description":
                if (!value.trim()) {
                    validation = false;
                    message = "Текст - обязательное поле";
                }
                break;
        }
    }
    return [message, validation];
};