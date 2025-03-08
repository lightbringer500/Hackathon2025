namespace zynas.thancle;

using {
    cuid,
    managed
} from '@sap/cds/common';

/**
 * 社員
 */
entity Employees {
    key ID         : String;
        name       : String       @mandatory;
        email      : EmailAddress @mandatory;
        retireDate : Date;
        seed       : Association to one Seeds
                         on seed.employee = $self;
        point      : Association to one Points
                         on point.employee = $self;
}

/**
 * タネレート
 */
entity SeedRates : cuid {
    name             : String;
    quantity         : Integer  @mandatory  @assert.unique;
    sender_amount    : Integer  @mandatory;
    recipient_amount : Integer  @mandatory;
}

/**
 * タネ履歴
 */
entity SeedHistories : cuid, managed {
    employee : Association to one Employees  @mandatory  @assert.target;
    quantity : Integer @mandatory;
}

/**
 * 社員ごとのタネ合計ビュー
 */
entity Seeds  as
    select from SeedHistories {
        employee,
        sum(quantity) as quantity
    }
    group by
        employee;

/**
 * ポイント履歴
 */
entity PointHistories : cuid, managed {
    employee : Association to one Employees  @mandatory  @assert.target;
    amount   : Integer @mandatory;
    message  : String;
}

/**
 * 社員ごとのポイント合計ビュー
 */
entity Points as
    select from PointHistories {
        employee,
        sum(amount) as amount
    }
    group by
        employee;

/**
 * タネ-ポイント対応表
 */
entity SeedPointMapping : cuid {
    seedHistory  : Association to one SeedHistories   @mandatory  @assert.target;
    pointHistory : Association to one PointHistories  @mandatory  @assert.target;
}

/** Eメールアドレス */
type EmailAddress : String;

/**
 * 賞品一覧
 */
entity Prizes : cuid {
    name            : String;
    information     : String;
    necessaryPoints : Integer @mandatory;
    startDate       : Date;
    endDate         : Date;
    display         : Boolean;
    image           : String;
}
