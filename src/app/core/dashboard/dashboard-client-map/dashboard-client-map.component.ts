import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMap } from '@angular/google-maps';
import { LocationModel } from '../../models/location.model';
import { Store } from '@ngxs/store';
import { AppState } from '../../ng-xs-store/states/app.state';
import { TransformedMarkerModel } from '../../models/transformed-merker.mode';

@Component({
  selector: 'gpa-dashboard-client-map',
  templateUrl: './dashboard-client-map.component.html',
})
export class DashboardClientMapComponent
  implements OnDestroy, AfterViewInit, OnChanges
{
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
  @Input() searchId: string = '';
  @Input() mapId: string = '';
  @Input() clientMarkers: {
    [index: string]: {
      name: string;
      latitude: number | null;
      longitude: number | null;
    };
  } = {};
  transformedMarkers: TransformedMarkerModel[] = [];
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientMarkers'] && !changes['clientMarkers'].firstChange) {
      this.transformedMarkers = this.clientsAsArray();

      if (this.transformedMarkers.length) {
        this.center = {
          lat: this.transformedMarkers[0].position.lat!,
          lng: this.transformedMarkers[0].position.lng!,
        };
      } else {
        this.center = {
          lat: 18.931924080755334,
          lng: -70.40929224394681,
        };
      }
    }
  }

  ngAfterViewInit(): void {
    this.mapLoaded$.subscribe((mapLoaded) => {
      if (mapLoaded) {
        this.initializePlaceSearch();
        this.initializePlacesService();
      }
    });
  }

  clientsAsArray() {
    let clients: TransformedMarkerModel[] = [];
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
              const selected = {
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

  handleSearchClient() {
    this.onSearchClient.emit();
  }
}
