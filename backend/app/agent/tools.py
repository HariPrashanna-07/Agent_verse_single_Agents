TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_habit",
            "description": "Create a new habit to track. Use when user wants to start tracking something.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Habit name, e.g. 'DSA Practice'"},
                    "target_value": {"type": "number", "description": "Daily target amount"},
                    "unit": {"type": "string", "description": "Unit of measurement, e.g. 'minutes', 'pages'"},
                    "frequency": {"type": "string", "description": "How often, default 'daily'"},
                    "category": {"type": "string", "description": "Category: Learning, Fitness, Health, Productivity, Reading, Mindfulness, Personal, Other"},
                    "description": {"type": "string", "description": "Optional description"},
                    "difficulty": {"type": "string", "description": "easy, medium, or hard"},
                },
                "required": ["name", "target_value", "unit"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_habits",
            "description": "Get list of all habits. Use when user asks about their habits.",
            "parameters": {
                "type": "object",
                "properties": {
                    "active": {"type": "boolean", "description": "Filter by active status"},
                    "category": {"type": "string", "description": "Filter by category"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_habit",
            "description": "Get a specific habit by ID or name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "name": {"type": "string", "description": "Partial or full habit name"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_habit",
            "description": "Update habit properties.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "name": {"type": "string"},
                    "target_value": {"type": "number"},
                    "unit": {"type": "string"},
                    "frequency": {"type": "string"},
                    "category": {"type": "string"},
                    "difficulty": {"type": "string"},
                    "active": {"type": "boolean"},
                },
                "required": ["habit_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_habit",
            "description": "Delete a habit permanently.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                },
                "required": ["habit_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "log_progress",
            "description": "Log progress for a habit. Use when user reports completing or working on a habit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "habit_name": {"type": "string", "description": "Habit name to look up"},
                    "actual_value": {"type": "number", "description": "Amount completed"},
                    "date": {"type": "string", "description": "Date in YYYY-MM-DD format, defaults to today"},
                    "notes": {"type": "string"},
                },
                "required": ["actual_value"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_today_goals",
            "description": "Get today's habits with progress and status. Use for daily overview.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_habit_history",
            "description": "Get historical progress logs for a habit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "habit_name": {"type": "string"},
                    "days": {"type": "integer", "description": "Number of days to look back, default 7"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_streak",
            "description": "Calculate current and best streak for a habit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "habit_name": {"type": "string"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_progress",
            "description": "Analyze habit performance: completion rate, average, trend, consistency. Use when user asks how they're doing.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "habit_name": {"type": "string"},
                    "days": {"type": "integer", "description": "Analysis window in days, default 7"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_daily_goals",
            "description": "Get personalized daily goal suggestions based on recent performance.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "adapt_goal",
            "description": "Change a habit's target value. Only use when user explicitly approves or requests a change.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "habit_name": {"type": "string"},
                    "new_target": {"type": "number"},
                    "reason": {"type": "string"},
                },
                "required": ["new_target", "reason"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_coaching_report",
            "description": "Generate a comprehensive coaching report across all habits.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {"type": "integer", "description": "Report window, default 7"},
                },
            },
        },
    },
]
