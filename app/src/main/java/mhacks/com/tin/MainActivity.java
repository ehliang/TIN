package mhacks.com.tin;

import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);


        final LocationListener locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null)
                {
                    locationManager.removeUpdates(this);
                }
                double lat = location.getLatitude();
                double longi = location.getLongitude();
                TextView test = (TextView) findViewById(R.id.test_text);
                test.setText("" + lat + longi);

                Log.i(String.valueOf(lat), String.valueOf(longi));

            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {

                Log.i("onstatus", "changed");
            }

            @Override
            public void onProviderEnabled(String provider) {
                Log.i("provider", "enabled");
            }

            @Override
            public void onProviderDisabled(String provider) {

                Log.i("provider", "disabled");
            }
        };

        Button sendLocation = (Button) findViewById(R.id.send_location);
        sendLocation.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i("pressed", "button");
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);

            }
        });



    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
