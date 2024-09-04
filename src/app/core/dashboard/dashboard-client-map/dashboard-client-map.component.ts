import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMap } from '@angular/google-maps';
import { LocationModel } from '../../models/location.model';

@Component({
  selector: 'gpa-dashboard-client-map',
  templateUrl: './dashboard-client-map.component.html',
})
export class DashboardClientMapComponent implements OnInit, OnDestroy {
  subscriptions$: Subscription[] = [];
  center: google.maps.LatLngLiteral = {
    lat: 18.931924080755334,
    lng: -70.40929224394681,
  };
  zoom = 15;
  display!: google.maps.LatLngLiteral;
  placeChangedListener: google.maps.MapsEventListener | null = null;
  geocoder = new google.maps.Geocoder();
  placesService!: google.maps.places.PlacesService;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @Input() locations: google.maps.LatLng[] = [];
  @Output() onSearchClient = new EventEmitter<void>();
  @Input() clientMarkers: {
    [index: string]: {
      name: string;
      latitude: number | null;
      longitude: number | null;
    };
  } = {};
  markerIcon1: google.maps.Icon = {
    url: 'assets/images/botellon-icon.png',
    scaledSize: new google.maps.Size(60, 60),
  };

  constructor(private spinner: NgxSpinnerService, private ngZone: NgZone) {}

  clientsAsArray() {
    let clients: {
      name: string;
      position: {
        lat: number;
        lng: number;
      };
    }[] = [];
    for (let key in this.clientMarkers) {
      let client = this.clientMarkers[key];
      if (client.latitude != null && client.longitude != null) {
        clients.push({
          name: client.name,
          position: {
            lat: client.latitude,
            lng: client.longitude,
          },
        });
      }
    }
    return clients;
  }

  ngOnInit(): void {
    this.initializePlaceSearch();
    this.initializePlacesService();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
    if (this.placeChangedListener) {
      google.maps.event.removeListener(this.placeChangedListener);
    }
  }

  mapClick(event: google.maps.MapMouseEvent) {
    this.spinner.show('map-google-spinner');
    if (event && event.latLng) {
      var loc: LocationModel = event.latLng.toJSON();
      this.center = event.latLng.toJSON();
      this.getPlaceDetails(event.latLng, (placeName, formattedAddress) => {
        this.ngZone.run(() => {
          console.log('Map clicked', loc);
          this.spinner.hide('map-google-spinner');
        });
      });
    } else {
      this.spinner.hide('map-google-spinner');
    }
  }

  initializePlaceSearch() {
    const input = document.getElementById('place-search') as HTMLInputElement;
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input);
      this.placeChangedListener = autocomplete.addListener(
        'place_changed',
        () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            let pl = place.geometry.location;
            this.ngZone.run(() => {
              this.center = {
                lat: pl.lat(),
                lng: pl.lng(),
              };
              this.zoom = 15;
              const selected = {
                ...this.center,
                placeName: place.name ?? null,
                formattedAddress: place.formatted_address ?? null,
              };
              console.log('Place changed', selected);
            });
          }
        }
      );
    }
  }

  initializePlacesService() {
    const mapElement = document.createElement('div');
    this.placesService = new google.maps.places.PlacesService(mapElement);
  }

  getPlaceDetails(
    latLng: google.maps.LatLng,
    onNameFetched: (
      name: string | null,
      formattedAddress: string | null
    ) => void
  ) {
    this.geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.placesService.getDetails(
          { placeId: results[0].place_id },
          (place, status) => {
            onNameFetched(
              place?.name ?? null,
              place?.formatted_address ?? null
            );
          }
        );
      } else {
        onNameFetched('', '');
      }
    });
  }

  handleSearchClient() {
    this.onSearchClient.emit();
  }
}
