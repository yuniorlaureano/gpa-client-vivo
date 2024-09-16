import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LocationModel } from '../models/location.model';
import { LocationWithNameModel } from '../models/location-with-name.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMap } from '@angular/google-maps';
import { Store } from '@ngxs/store';
import { AppState } from '../ng-xs-store/states/app.state';

@Component({
  selector: 'gpa-map-google',
  templateUrl: './map-google.component.html',
  styleUrl: './map-google.component.css',
})
export class MapGoogleComponent implements OnDestroy, AfterViewInit {
  @Input() visible: boolean = false;
  @Output() onLocationChange = new EventEmitter<LocationWithNameModel>();
  @Output() onClose = new EventEmitter();
  selectedLocation: LocationWithNameModel | null = null;
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
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @Input() locations: { lat: number; lng: number; name: string }[] = [];
  @Input() searchId: string = '';
  @Input() mapId: string = '';
  markerIcon1: google.maps.Icon = {
    url: 'assets/images/botellon-icon.png',
    scaledSize: new google.maps.Size(60, 60),
  };
  mapLoaded$ = this.store.select(AppState.getMapLoaded);

  constructor(
    private spinner: NgxSpinnerService,
    private ngZone: NgZone,
    private store: Store
  ) {}

  ngAfterViewInit(): void {
    this.mapLoaded$.subscribe((mapLoaded) => {
      if (mapLoaded) {
        this.initializePlaceSearch();
        this.initializePlacesService();
      }
    });
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
          this.selectedLocation = {
            ...loc,
            placeName: placeName,
            formattedAddress: formattedAddress,
          };
          this.spinner.hide('map-google-spinner');
        });
      });
    } else {
      this.spinner.hide('map-google-spinner');
    }
  }

  initializePlaceSearch() {
    const input = document.getElementById(this.searchId) as HTMLInputElement;
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
              this.selectedLocation = {
                ...this.center,
                placeName: place.name ?? null,
                formattedAddress: place.formatted_address ?? null,
              };
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

  close() {
    if (this.selectedLocation) {
      this.onLocationChange.emit(this.selectedLocation);
      this.selectedLocation = null;
    }
    this.onClose.emit();
  }

  transformLocations() {
    let locations: {
      name: string;
      position: {
        lat: number;
        lng: number;
      };
    }[] = [];
    this.locations.forEach((location) => {
      locations.push({
        name: location.name,
        position: {
          lat: location.lat,
          lng: location.lng,
        },
      });
    });
    return locations;
  }
}
