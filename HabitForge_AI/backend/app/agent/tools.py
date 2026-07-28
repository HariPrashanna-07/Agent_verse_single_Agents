TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_habit",
            "description": "Create a new habit to track. Use when user wants to start tracking something new.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Habit name, e.g. 'DSA Practice'"},
                    "target_value": {"type": "number", "description": "Daily target amount"},
                    "unit": {"type": "string", "description": "Unit of measurement, e.g. 'minutes', 'pages'"},
                    "frequency": {"type": ["string", "null"], "description": "How often, default 'daily'"},
                    "category": {"type": ["string", "null"], "description": "Category: Learning, Fitness, Health, Productivity, Reading, Mindfulness, Personal, Other"},
                    "description": {"type": ["string", "null"], "description": "Optional description"},
                    "difficulty": {"type": ["string", "null"], "description": "easy, medium, or hard"},
                },
                "required": ["name", "target_value", "unit"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_habits",
            "description": "Get list of user's habits. Use ONLY when user explicitly asks to see their habits list, or when you need habit names/targets to answer a specific question. Do NOT call this for general coaching questions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "active": {"type": ["boolean", "null"], "description": "Filter by active status"},
                    "category": {"type": ["string", "null"], "description": "Filter by category"},
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
                    "habit_id": {"type": ["integer", "null"]},
                    "name": {"type": ["string", "null"], "description": "Partial or full habit name"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_habit",
            "description": "Update habit properties like name, target, category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": "integer"},
                    "name": {"type": ["string", "null"]},
                    "target_value": {"type": ["number", "null"]},
                    "unit": {"type": ["string", "null"]},
                    "frequency": {"type": ["string", "null"]},
                    "category": {"type": ["string", "null"]},
                    "difficulty": {"type": ["string", "null"]},
                    "active": {"type": ["boolean", "null"]},
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
            "description": "Log progress for a habit. Use when the user says they completed, finished, or did a habit today or on a specific date. ALWAYS extract the habit name from the user's message and pass it as habit_name. For example, if they say 'I completed Reading today', pass habit_name='Reading'. If the user does not specify an amount, omit actual_value and the system will use the habit's full target value automatically.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": ["integer", "null"], "description": "Habit ID if known"},
                    "habit_name": {"type": ["string", "null"], "description": "The habit name extracted from the user's message, e.g. 'Reading', 'Exercise', 'DSA Practice'. Always include this when the user mentions a habit name."},
                    "actual_value": {"type": ["number", "null"], "description": "Amount completed. Omit if user did not specify - the habit target will be used."},
                    "date": {"type": ["string", "null"], "description": "Date in YYYY-MM-DD format, defaults to today"},
                    "notes": {"type": ["string", "null"], "description": "Optional notes"},
                },
                "required": [],
            },
        },
    },

    {
        "type": "function",
        "function": {
            "name": "get_today_goals",
            "description": "Get today's habits with current progress and completion status. Use when user asks what to do today or wants a daily overview.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_habit_history",
            "description": "Get historical progress logs for a specific habit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": ["integer", "null"]},
                    "habit_name": {"type": ["string", "null"]},
                    "days": {"type": ["integer", "null"], "description": "Number of days to look back, default 7"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_streak",
            "description": "Calculate current and best streak for a habit. Use when user asks about streaks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": ["integer", "null"]},
                    "habit_name": {"type": ["string", "null"], "description": "Habit name. Leave empty to find the best streak across all habits."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_progress",
            "description": "Analyze habit performance: completion rate, trend, and consistency. Call with NO arguments (omit habit_id and habit_name) to analyze ALL habits at once - use this when the user asks general questions like 'which habit am I struggling with?', 'how am I doing overall?', or 'what is my weakest habit?'. Supply habit_name only when the user asks about one specific habit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": ["integer", "null"]},
                    "habit_name": {"type": ["string", "null"]},
                    "days": {"type": ["integer", "null"], "description": "Analysis window in days, default 7"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_daily_goals",
            "description": "Get personalized daily goal suggestions based on recent performance. Use when user asks what to focus on today.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "adapt_goal",
            "description": "Change a habit's target value. Only use when user explicitly approves or requests a change to their target.",
            "parameters": {
                "type": "object",
                "properties": {
                    "habit_id": {"type": ["integer", "null"]},
                    "habit_name": {"type": ["string", "null"]},
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
            "description": "Generate a comprehensive coaching report across all habits showing overall completion rate, strongest/weakest habits, and streaks. Use when user asks how they are doing overall this week.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {"type": ["integer", "null"], "description": "Report window, default 7"},
                },
            },
        },
    },
]
