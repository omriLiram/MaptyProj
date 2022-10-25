'use strict';

// prettier-ignore
//const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//let map, mapEvent; //must declare outside the funcs because we use it few timesג unless we use classes

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; //[]
    this.distance = distance; //in km
    this.duration = duration; //in min
    // this.setDescription();
  }
  setDescription() {
    const month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      month[this.date.getMonth()]
    }`;
  }
}

class Running extends Workout {
  type = 'runnig';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); //calling the func we created
    this.setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this.setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration / 60;
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178); //coord array at the beginning
const cycling1 = new Cycling([39, -12], 27, 96, 523); //coord array at the beginning
console.log(run1, cycling1);

///////////////////app architecture//////////////////////
//workouts=[];
class App {
  map;
  mapEvent;
  workout;
  #workouts = [];

  constructor() {
    this._getPosition(); //calling here to load it once the app is loaded at the same time

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this.moveTOPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () //next function- error function incase there is no position
        {
          alert('could not get your position!');
        }
      ); // this is all part of the navigator.geolocation API}
  }

  _loadMap(position) {
    const { latitude } = position.coords; // pulling out the latitude from the API using destruct
    const { longitude } = position.coords; // pulling out the longitude from the API using destruct
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    //adding the code from the leaflet library to use map:

    const coords = [latitude, longitude]; //building an array to put in instead of the defalut of leaflet at setView and L.marker

    this.map = L.map('map').setView(coords, 13); //must have an id of map at the html

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      //changing the map style by searching code for one google
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    //marking a spot on the map  -handling clicks on map

    this.map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.mapEvent = mapE;
    form.classList.remove('hidden'); //revealing the form when clicking
    inputDistance.focus();
  }

  hideform() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    //because of animation from css
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); // will hide the rest each time other than elevation change
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden'); // will hide the rest each time other than cadence change
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp)); // function that check valid numbers
    const allPositive = (...inputs) => inputs.every(inp => inp > 0); // checking if positive

    e.preventDefault();
    //get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.mapEvent.latlng;
    let workout;

    //if running create running obj
    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        /*!Number.isFinite(distance) ||
      !Number.isFinite(duration) ||
      !Number.isFinite(cadence)*/
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('input has to be positive numbers!'); //checking if valid and positive

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if cycling create cyc obj
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('wrong!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //add new obj to workout array
    this.#workouts.push(workout);
    console.log(workout);

    this.renderWorkouyMarker(workout);
    this.renderWorkout(workout);

    //render workout on list

    //hide form+ clear input fields

    // clear input fields
    this.hideform();

    //display marker

    /*const { lat, lng } = this.mapEvent.latlng; //re-defined the the const of the method _newWorkout
      L.marker([lat, lng]) //custumize the marker using the code from documantation at leaflet:
        .addTo(this.map)
        .bindPopup(
          L.popup({
            //creating an object with costum variables from leaflet
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
          })
        )
        .setPopupContent('workout')
        .openPopup();*/
  }

  renderWorkouyMarker(workout) {
    L.marker(workout.coords) //custumize the marker using the code from documantation at leaflet:
      .addTo(this.map)
      .bindPopup(
        L.popup({
          //creating an object with costum variables from leaflet
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${this.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : ' 🐰🚴‍♀️'}${workout.description}`
      )

      .openPopup();
  }
  renderWorkout(workout) {
    let html = `<li class="workout workout--running" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : ' 🚴‍♀️'
      }</span>
      <span class="workout__value"> ${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    
    `;
    if (workout.type === 'runnig')
      html += `
<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>`;
    if (workout.type === 'cycling')
      html += `<div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
          `;
    //to choose where we are placeing this at the DOM we check at the html. we would like at FORM :
    form.insertAdjacentHTML('afterend', html);
  }
  moveTOPopup(e) {
    const workoutEL = e.target.closest('.workout');
    console.log(workoutEL);
    if (!workoutEL) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEL.dataset.id
    );
    this.map.setView(workout.coords, 13, {
      //method from leaflet to animate the movemnt to the workout
      animate: true,
      pan: { duration: 1 },
    });
  }
}

const app = new App();

// the application functions before putting all in classes :

//building a geolocation map with geolocation API making a success function if theres position "GPS on" and user approves:

/*
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords; // pulling out the latitude from the API using destruct
      const { longitude } = position.coords; // pulling out the longitude from the API using destruct
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      //adding the code from the leaflet library to use map:

      const coords = [latitude, longitude]; //building an array to put in instead of the defalut of leaflet at setView and L.marker

      map = L.map('map').setView(coords, 13); //must have an id of map at the html

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        //changing the map style by searching code for one google
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //marking a spot on the map  -handling clicks on map

      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden'); //revealing the form when clicking
        inputDistance.focus();
        //using on method we can get the data of spot we click on the map and then use it to mark it
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng; //we destruct these data after seeing this is where the gps point is located using ON

        L.marker([lat, lng]) //custumize the marker using the code from documantation at leaflet:
          .addTo(map)
          .bindPopup(
            L.popup({
              //creating an object with costum variables from leaflet
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('workout')
          .openPopup();
      });
    },
    //next function- error function incase there is no position
    function () {
      alert('could not get your position!');
    }
  ); // this is all part of the navigator.geolocation API

form.addEventListener('submit', function (e) {
  // clear input fields
  inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';

  //display marker
  e.preventDefault;
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng]) //custumize the marker using the code from documantation at leaflet:
    .addTo(map)
    .bindPopup(
      L.popup({
        //creating an object with costum variables from leaflet
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('workout')
    .openPopup();
});
//costumizing the form everytime choosing between running and cycling (the "Type" in the form)the elevation or the cadence apears
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); // will hide the rest each time other than elevation change
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden'); // will hide the rest each time other than cadence change
}); 

windows Key + Full Stop (.) or Windows Key + Semi-Colon (;)-imoji



*/
