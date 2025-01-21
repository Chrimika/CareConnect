import moment from 'moment';

class Consultation {
  date: Date;
  heure: string;
  nomPatient: string;
  prenomPatient: string;
  typeConsultation: string;

  constructor(
    date: Date,
    heure: string,
    nomPatient: string,
    prenomPatient: string,
    typeConsultation: string
  ) {
    this.date = date;
    this.heure = heure;
    this.nomPatient = nomPatient;
    this.prenomPatient = prenomPatient;
    this.typeConsultation = typeConsultation;
  }

  // Méthode pour obtenir les informations complètes de la consultation
  getDetails(): string {
    return `Consultation de type "${this.typeConsultation}" pour ${this.prenomPatient} ${this.nomPatient}, prévue le ${moment(this.date).format(
      'dddd D MMMM YYYY'
    )} à ${this.heure}`;
  }

  // Méthode statique pour lister les consultations (peut être connectée à une API)
  static listerConsultations(): Consultation[] {
    return [
      new Consultation(new Date(), '10:00', 'Doe', 'John', 'Générale'),
      new Consultation(new Date(), '14:30', 'Smith', 'Jane', 'Spécialiste'),
    ];
  }
}

// Export de la classe
export default Consultation;
