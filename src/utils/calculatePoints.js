function moreYes(list) {
    if (!list || list.length === 0) return 0; // Защита от пустых списков
    
    let yes = 0;
    let no = 0;

    for (const answer of list) {
        if (answer == 1) {
            yes++;
        } else {
            no++;
        }
    }
    return yes >= no ? 1 : 0;
}

exports.calculate_points = async (userAnswers) => {
    // userAnswers - это объект с группированными ответами по param_id
    // Пример: { '25': [1, 0, 1], '26': [0, 1, 1], ... }

    // Приводим ключи param_id к строковому виду для единообразия
    const types = {};
    for (const [paramId, answers] of Object.entries(userAnswers)) {
        types[paramId.toString()] = answers;
    }

    let res = '0.0'; // Значение по умолчанию

    // Модифицированная логика для работы с param_id 25-31 вместо 1-7
    if (moreYes(types['25'])) { // Было types['1']
        if (moreYes(types['26'])) { // Было types['2']
            if (moreYes(types['28'])) { // Было types['4']
                res = '3.6-4.0';
            } else {
                res = '3.1-3.5';
            }
        } else {
            if (moreYes(types['30'])) { // Было types['6']
                res = '2.6-3.0';
            } else {
                res = '2.1-2.5';
            }
        }
    } else {
        if (moreYes(types['27'])) { // Было types['3']
            if (moreYes(types['29'])) { // Было types['5']
                res = '1.5-2.0';
            } else {
                res = '1.1-1.4';
            }
        } else {
            if (moreYes(types['31'])) { // Было types['7']
                res = '0.6-1.0';
            } else {
                res = '0.1-0.5';
            }
        }
    }
    
    return res;
};