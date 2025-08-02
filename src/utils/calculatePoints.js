function moreYes(list) {
    if (!list || list.length === 0) return false; // Возвращаем false для пустых списков

    let yes = 0;
    let no = 0;

    for (const answer of list) {
        if (answer == 'Да') {
            yes++;
        } else {
            no++;
        }
    }
    return yes > no; // Строго больше, а не больше или равно
}

exports.calculate_points = async (userAnswers) => {
    // Проверяем, что userAnswers существует и не пустой
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
        return '0.0';
    }

    // Приводим ключи param_id к строковому виду для единообразия
    const types = {};
    for (const [paramId, answers] of Object.entries(userAnswers)) {
        types[paramId.toString()] = answers;
    }

    // Проверяем наличие всех необходимых параметров
    const requiredParams = ['25', '26', '27', '28', '29', '30', '31'];
    for (const param of requiredParams) {
        if (!types[param] || types[param].length === 0) {
            return '0.0'; // Если какой-то параметр отсутствует, возвращаем минимальное значение
        }
    }

    // Модифицированная логика определения уровня
    if (moreYes(types['25'])) {
        if (moreYes(types['26'])) {
            if (moreYes(types['28'])) {
                return '3.6-4.0';
            } else {
                return '3.1-3.5';
            }
        } else {
            if (moreYes(types['30'])) {
                return '2.6-3.0';
            } else {
                return '2.1-2.5';
            }
        }
    } else {
        if (moreYes(types['27'])) {
            if (moreYes(types['29'])) {
                return '1.5-2.0';
            } else {
                return '1.1-1.4';
            }
        } else {
            if (moreYes(types['31'])) {
                return '0.6-1.0';
            } else {
                return '0.1-0.5';
            }
        }
    }
};