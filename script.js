window.addEventListener('load', () => {
    const savedPlan = localStorage.getItem('userWorkoutPlan');
    if (savedPlan) {
        document.getElementById('planDetails').innerHTML = savedPlan;
        document.getElementById('resultSection').style.display = 'block';
    }
    displayProgress();
});

function generatePlan() {
    const age = document.getElementById('age').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const goal = document.getElementById('goal').value;
    const intensity = document.getElementById('intensity').value;

    if(!age || !height || !weight) { 
        alert("দয়া করে সঠিক তথ্য দিন!"); return; 
    }

    // BMI Badge Logic
    let bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    document.getElementById('bmiBadge').innerHTML = `Your BMI: ${bmi}`;

    const planDetails = document.getElementById('planDetails');
    let finalHTML = "";

    // ---------------------------------------------------------
    // 1. POWERLIFTING LOGIC (আপনার অরিজিনাল ২ মাসের কোড)
    // ---------------------------------------------------------
    if (goal === "powerlifting") {
        let plConfig = intensity === "Beginner" ? {weight: "65% 1RM", reps: "6", sets: "5"} : 
                       intensity === "Advance" ? {weight: "75% 1RM", reps: "5", sets: "4"} : {weight: "85% 1RM", reps: "3", sets: "3"};

        const powerliftingData = [
            { day: "Day 1: Squat Focus", exercises: [
                {name: "Low Bar Squat", sets: plConfig.sets, reps: plConfig.reps, weight: plConfig.weight},
                {name: "Leg Press", sets: "3", reps: "8-10", weight: "Accessory"},
                {name: "Leg Curle", sets: "3", reps: "8-10", weight: "Accessory"},
                {name: "Calf Raises", sets: "4", reps: "15", weight: "Accessory"}
            ]},
            { day: "Day 2: Bench Focus", exercises: [
                {name: "Bench Press", sets: plConfig.sets, reps: plConfig.reps, weight: plConfig.weight},
                {name: "Incline DB Press", sets: "3", reps: "10", weight: "Accessory"},
                {name: "Tricep Dips", sets: "3", reps: "10", weight: "Accessory"},
                {name: "Tricep Extension", sets: "3", reps: "10", weight: "Accessory"}
            ]},
            { day: "Day 3: Deadlift Focus", exercises: [
                {name: "Deadlift", sets: plConfig.sets, reps: plConfig.reps, weight: plConfig.weight},
                {name: "Lat Pulldowns", sets: "4", reps: "8", weight: "Accessory"},
                {name: "Barble Curle", sets: "3", reps: "10", weight: "Accessory"},
                {name: "Hammar Curle", sets: "3", reps: "10", weight: "Accessory"}
            ]},
            { day: "Day 4: Accessory Strength", exercises: [
                {name: "Overhead Press", sets: plConfig.sets, reps: plConfig.reps, weight: plConfig.weight},
                {name: "DB Press", sets: "3", reps: "12", weight: "Accessory"},
                {name: "Lateral Raises", sets: "3", reps: "15", weight: "Accessory"},
                {name: "Pec Dec Fly", sets: "3", reps: "15", weight: "Accessory"}
            ]}
        ];

        finalHTML += `<h3 style="color:#f9b17a; text-align:center;">${intensity} Powerlifting (2 Months)</h3>`;
        for (let w = 1; w <= 8; w++) {
            finalHTML += `<div class="week-section"><h4>Week ${w}</h4>`;
            powerliftingData.forEach(item => finalHTML += generatePLTable(item.day, item.exercises));
            finalHTML += `</div><hr class="week-divider">`;
        }
    } 
    // ---------------------------------------------------------
    // 2. OTHER GOALS (আপনার অরিজিনাল সব এক্সারসাইজ লাইব্রেরি)
    // ---------------------------------------------------------
    else {
        const lib = {
            chest: ["Bench Press", "Incline DB Press", "Chest Flyes", "Pushups"],
            chest_alt: ["Weighted Dips", "Decline Cable Flyes", "Landmine Press", "Floor Press"],
            back: ["Lat Pulldowns", "Seated Rows", "One Arm Row", "Pull Ups"],
            back_alt: ["Deadlift", "Weighted Pullups", "Meadows Row", "T-Bar Row"],
            shoulder: ["Overhead Press", "Lateral Raises", "Front Raises", "Face Pulls"],
            shoulder_alt: ["Arnold Press", "Upright Rows", "Handstand Pushups", "Bus Driver"],
            triceps: ["Tricep Pushdowns", "Overhead Extension", "Skull Crushers"],
            biceps: ["Barbell Curls", "Hammer Curls", "Preacher Curls"],
            legs: ["Squats", "Leg Press", "Leg Extensions", "Leg Curls", "Calf Raises"],
            abs: ["Plank", "Leg Raises", "Crunches"],
            reardelt: ["Rear Delt Flyes", "Face Pulls"],
            cardio: ["Running", "Burpees", "Jumping Jacks", "Mountain Climbers"]
        };

        let daysPerWeek = (intensity === "Beginner") ? 6 : (intensity === "Advance" ? 5 : 4);
        finalHTML += `<h3 style="color:#f9b17a; text-align:center;">1 Month ${goal.toUpperCase()} Plan</h3>`;
        
        for (let w = 1; w <= 4; w++) {
            finalHTML += `<div class="week-section"><h4>Week ${w}</h4>`;
            for (let d = 1; d <= daysPerWeek; d++) {
                let plan = getMuscleSplit(d, intensity, lib, goal);
                finalHTML += generateGenericTable(`Day ${d}: ${plan.title}`, plan.exercises, goal);
            }
            finalHTML += `</div><hr class="week-divider">`;
        }
    }

    const dietHTML = generateDiet(goal, parseFloat(weight), parseFloat(height), parseFloat(age));
    const fullHTML = finalHTML + dietHTML;
    planDetails.innerHTML = fullHTML;
    document.getElementById('resultSection').style.display = 'block';
    localStorage.setItem('userWorkoutPlan', fullHTML);
}

// আপনার সেই ডায়েট লজিক
function generateDiet(goal, weight, height, age) {
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    let tdee = Math.round(bmr * 1.375);
    let calories = (goal === "weightloss") ? Math.round(tdee - 500) : (goal === "weightgain" || goal === "powerlifting") ? Math.round(tdee + 500) : Math.round(tdee + 250);
    let p_gram = (goal === "weightloss" || goal === "bodybuilding") ? Math.round(weight * 2.2) : Math.round(weight * 2.0);
    let f_gram = Math.round((calories * 0.25) / 9); 
    let c_gram = Math.round((calories - ((p_gram * 4) + (f_gram * 9))) / 4);
    let total_meat = Math.round((p_gram - 32) / 0.25);

    return `<div class="diet-box"><h3>🍎 Nutrition: ${calories} Kcal | ${p_gram}g Protein</h3><table><tr><td>Morning</td><td>Oats (${Math.round(c_gram*0.3)}g) + 3 Eggs + Milk</td></tr><tr><td>Lunch</td><td>Rice (${Math.round(c_gram*0.4)}g) + Meat (${Math.round(total_meat*0.5)}g)</td></tr><tr><td>Night</td><td>Rice/Roti (${Math.round(c_gram*0.3)}g) + Meat (${Math.round(total_meat*0.4)}g)</td></tr></table></div>`;
}

// Helpers (আপনার অরিজিনাল Split লজিক)
function getMuscleSplit(day, intensity, lib, goal) {
    let isPro = (intensity === "Pro");
    let c = isPro ? lib.chest_alt : lib.chest;
    let b = isPro ? lib.back_alt : lib.back;
    let s = isPro ? lib.shoulder_alt : lib.shoulder;

    if (intensity === "Beginner") {
        if (day % 3 === 1) return { title: "Chest, Shoulder & Triceps", exercises: [...lib.chest.slice(0,2), ...lib.shoulder.slice(0,2), ...lib.triceps.slice(0,2)] };
        if (day % 3 === 2) return { title: "Back, Rear Delt & Biceps", exercises: [...lib.back.slice(0,2), ...lib.reardelt.slice(0,2), ...lib.biceps.slice(0,2)] };
        return { title: "Legs & Abs", exercises: [...lib.legs.slice(0,3), ...lib.abs.slice(0,2)] };
    } else {
        if (day === 1) return { title: "Chest & Biceps", exercises: [...c.slice(0,4), ...lib.biceps.slice(0,2)] };
        if (day === 2) return { title: "Back & Triceps", exercises: [...b.slice(0,4), ...lib.triceps.slice(0,2)] };
        if (day === 3) return { title: "Shoulder & Abs", exercises: [...s.slice(0,4), ...lib.abs.slice(0,2)] };
        if (day === 4) return { title: "Legs Focus", exercises: lib.legs.slice(0,5) };
        return { title: goal === "weightloss" ? "Cardio Burn" : "Weak Point Recovery", exercises: goal === "weightloss" ? lib.cardio.slice(0,4) : [lib.chest[0], lib.back[0]] };
    }
}

// Table Generators (সাথে চেকবক্স ✅)
function generatePLTable(title, exercises) {
    let html = `<table><tr><th colspan="4" class="day-header">${title}</th></tr><tr><th>✅</th><th>Exercise</th><th>Sets/Reps</th><th>Intensity</th></tr>`;
    exercises.forEach(ex => {
        html += `<tr><td><input type="checkbox" class="workout-check"></td><td>${ex.name}</td><td>${ex.sets}x${ex.reps}</td><td style="color:#f9b17a;">${ex.weight}</td></tr>`;
    });
    return html + `</table><br>`;
}

function generateGenericTable(title, exercises, goal) {
    let sets = (goal === "weightloss") ? "3" : "4";
    let reps = (goal === "weightloss") ? "15-20" : "8-12";
    let html = `<table><tr><th colspan="3" class="day-header">${title}</th></tr><tr><th>✅</th><th>Exercise</th><th>Sets/Reps</th></tr>`;
    exercises.forEach(ex => {
        html += `<tr><td><input type="checkbox" class="workout-check"></td><td>${ex}</td><td>${sets}x${reps}</td></tr>`;
    });
    return html + `</table><br>`;
}

// Progress Tracker Logic
function saveProgress() {
    let w = document.getElementById('dailyWeight').value;
    if(!w) return;
    let log = JSON.parse(localStorage.getItem('weightLog')) || [];
    log.push({ d: new Date().toLocaleDateString(), w: w });
    localStorage.setItem('weightLog', JSON.stringify(log));
    displayProgress();
}

function displayProgress() {
    let log = JSON.parse(localStorage.getItem('weightLog')) || [];
    document.getElementById('weightLog').innerHTML = log.slice(-3).map(i => `<li>${i.d}: ${i.w}kg</li>`).join('');
}

function resetAll() {
    if(confirm("সব ডাটা মুছে ফেলতে চান?")) { localStorage.clear(); location.reload(); }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('appTheme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}