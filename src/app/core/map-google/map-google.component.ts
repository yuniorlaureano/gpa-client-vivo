import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LocationModel } from '../models/location.model';
import { LocationWithNameModel } from '../models/location-with-name.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'gpa-map-google',
  templateUrl: './map-google.component.html',
  styleUrl: './map-google.component.css',
})
export class MapGoogleComponent implements OnInit, OnDestroy, OnChanges {
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
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  markerIcon: HTMLImageElement = document.createElement('img');
  @Input() locations: google.maps.LatLng[] = [];

  constructor(private spinner: NgxSpinnerService, private ngZone: NgZone) {
    this.markerIcon.src = 'assets/images/botellon-icon.png';
    this.markerIcon.width = 60;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        if (this.locations.length > 0) {
          this.center = {
            lat: this.locations[0].lat(),
            lng: this.locations[0].lng(),
          };
        } else {
          this.center = {
            lat: 18.931924080755334,
            lng: -70.40929224394681,
          };
        }

        this.clearMarkers();
        this.setNewMarkers(this.locations);
      }
    }
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
    console.log('mapClick');
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

  private clearMarkers(): void {
    this.markers.forEach((marker) => (marker.map = null));
    this.markers = [];
  }

  private setNewMarkers(locations: google.maps.LatLng[]): void {
    locations.forEach((position) => {
      if (position.lat != null || position.lng != null) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: this.map.googleMap,
          content: this.markerIcon,
        });
        this.markers.push(marker);
      }
    });
  }

  close() {
    if (this.selectedLocation) {
      this.onLocationChange.emit(this.selectedLocation);
    }
    this.onClose.emit();
  }
}
