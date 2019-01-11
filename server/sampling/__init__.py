
COLLECTIONS = {
    'hour_samples': {
        'sample_period': 30,  # s
        'key': 'timestamp_hour',
        'periodicity': 'in_hours',
        'diff': 1,
        'inner_range': (60, 30),  # (end, step)
        'max_value': 60,
        'reference': 'hour',
        'sample_periods': ['minute', 'second']
    },
    'day_samples': {
        'sample_period': 120,  # s
        'key': 'timestamp_day',
        'periodicity': 'in_days',
        'diff': 1,
        'inner_range': (60, 2),
        'max_value': 24,
        'reference': 'day',
        'sample_periods': ['hour', 'minute']
    },
    'week_samples': {
        'sample_period': 7 * 120,  # s
        'key': 'timestamp_day_week',
        'periodicity': 'in_days',
        'diff': 1,
        'inner_range': (60, 2),
        'max_value': 24,
        'reference': 'day',
        'sample_periods': ['hour', 'minute']
    }
}